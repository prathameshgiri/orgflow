import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";
import * as nodemailer from "nodemailer";

// Initialize Supabase Service Client (bypasses RLS) or fallback to anon if missing
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
const supabaseAdmin = createClient(supabaseUrl, serviceKey);

// Nodemailer Ethereal Setup (Test Email Account)
let transporter: nodemailer.Transporter | null = null;
let testAccount: nodemailer.TestAccount | null = null;

async function initMailer() {
  if (!transporter) {
    console.log("Setting up Ethereal Mail for Workflow Engine...");
    testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
    console.log("Ethereal Mail initialized. Ready to send simulated emails.");
  }
}
initMailer();

export const triggerWorkflow = async (req: Request, res: Response) => {
  const { event, organization_id, payload } = req.body;

  if (!event || !organization_id) {
    return res.status(400).json({ error: "Missing event or organization_id" });
  }

  console.log(`[Workflow Engine] Received trigger '${event}' for Org ${organization_id}`);

  try {
    // 1. Find active workflows for this event and org
    const { data: workflows, error: wfError } = await supabaseAdmin
      .from("workflows")
      .select(`
        id, name,
        automation_rules (
          id, condition_json, action_type, action_payload, step_order
        )
      `)
      .eq("organization_id", organization_id)
      .eq("trigger_event", event)
      .eq("is_active", true);

    if (wfError) throw wfError;

    const executionLogs = [];

    // --- GLOBAL NOTIFICATIONS ---
    if (event === "incident_created") {
      const { data: org, error: orgError } = await supabaseAdmin
        .from("organizations")
        .select("settings")
        .eq("id", organization_id)
        .single();
        
      if (!orgError && org?.settings) {
        const settings = org.settings;
        if (settings.incidentAlerts && (payload.priority === 'p1_critical' || payload.priority === 'p2_high')) {
          console.log(`[Global Notifications] Sending P1/P2 Alert for incident ${payload.id}`);
          if (transporter) {
            const info = await transporter.sendMail({
              from: '"ORG MAN System" <no-reply@orgman.com>',
              to: "admins@orgman.com", // In a real app, you would fetch the org's admin emails
              subject: `URGENT: New ${payload.priority} Incident - ${payload.title || 'Untitled'}`,
              text: `A new critical/high incident has been reported.\n\nPlease check the dashboard immediately.`,
              html: `<p>A new critical/high incident has been reported.</p><p>Please check the dashboard immediately.</p>`
            });
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`[Global Notifications] Alert sent! View it here: ${previewUrl}`);
            executionLogs.push({ action: 'global_alert_sent', previewUrl });
          }
        }
      }
    }
    // ----------------------------

    if (!workflows || workflows.length === 0) {
      console.log(`[Workflow Engine] No active custom workflows found for event '${event}'.`);
      return res.json({ success: true, logs: executionLogs });
    }

    // 2. Evaluate each custom workflow
    for (const wf of workflows) {
      console.log(`[Workflow Engine] Evaluating Workflow: ${wf.name}`);
      const rules = wf.automation_rules || [];
      // Sort by step_order
      rules.sort((a: any, b: any) => a.step_order - b.step_order);

      for (const rule of rules) {
        // Evaluate condition (basic exact match logic for now)
        let conditionMet = true;
        if (rule.condition_json && Object.keys(rule.condition_json).length > 0) {
          for (const [key, expectedValue] of Object.entries(rule.condition_json)) {
            // Check if payload has the key and it matches
            if (payload[key] !== expectedValue) {
              conditionMet = false;
              break;
            }
          }
        }

        if (conditionMet) {
          console.log(`[Workflow Engine] Rule condition met. Executing action: ${rule.action_type}`);
          
          if (rule.action_type === 'send_email') {
            const emailPayload = rule.action_payload as { to: string, subject: string, body: string };
            if (transporter && emailPayload) {
              // Replace template variables like {{title}} with payload values
              let parsedBody = emailPayload.body;
              let parsedSubject = emailPayload.subject;
              Object.keys(payload).forEach(key => {
                const regex = new RegExp(`{{${key}}}`, 'g');
                parsedBody = parsedBody.replace(regex, payload[key] || '');
                parsedSubject = parsedSubject.replace(regex, payload[key] || '');
              });

              const info = await transporter.sendMail({
                from: '"ORG MAN Automations" <no-reply@orgman.com>',
                to: emailPayload.to || "test@example.com",
                subject: parsedSubject,
                text: parsedBody,
                html: `<p>${parsedBody.replace(/\n/g, '<br/>')}</p>`
              });

              const previewUrl = nodemailer.getTestMessageUrl(info);
              console.log(`[Workflow Engine] Email sent! View it here: ${previewUrl}`);
              executionLogs.push({ action: 'send_email', previewUrl });
            }
          } else if (rule.action_type === 'update_status') {
            const updatePayload = rule.action_payload as { target_table: string, status: string };
            if (updatePayload && updatePayload.target_table && payload.id) {
              await supabaseAdmin
                .from(updatePayload.target_table)
                .update({ status: updatePayload.status })
                .eq('id', payload.id);
              console.log(`[Workflow Engine] Updated ${updatePayload.target_table} ${payload.id} to status ${updatePayload.status}`);
              executionLogs.push({ action: 'update_status', target: payload.id, status: updatePayload.status });
            }
          }
        } else {
          console.log(`[Workflow Engine] Rule condition NOT met. Skipping action.`);
        }
      }
    }

    res.json({ success: true, logs: executionLogs });

  } catch (error: any) {
    console.error("[Workflow Engine] Error processing workflow:", error);
    res.status(500).json({ error: error.message });
  }
};
