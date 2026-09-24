import { Router } from "express";
import { sendNotificationEmail } from "../utils/email";
import { getAuthSupabase } from "../utils/supabaseAuth";

const router = Router();

router.post("/assignment", async (req, res) => {
  try {
    const { assigneeId, type, itemTitle, itemDescription, linkUrl } = req.body;
    
    if (!assigneeId) {
      return res.status(400).json({ error: "Assignee ID is required" });
    }

    const supabase = getAuthSupabase(req);
    
    // Fetch user email by assigneeId
    const { data: user, error } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", assigneeId)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: "Assignee not found" });
    }

    // Format the email
    const subject = `New ${type} Assigned to You: ${itemTitle}`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
          <h2 style="color: white; margin: 0;">New Assignment Notification</h2>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333;">Hi <strong>${user.full_name || 'Team Member'}</strong>,</p>
          <p style="font-size: 16px; color: #333;">A new <strong>${type.toLowerCase()}</strong> has been assigned to you.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #4f46e5; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e293b;">${itemTitle}</h3>
            <p style="color: #475569; white-space: pre-wrap;">${itemDescription || 'No description provided.'}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${linkUrl || 'http://localhost:8080/dashboard'}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View ${type}</a>
          </div>
        </div>
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b;">
          <p>This is an automated message from OrgTask. Please do not reply.</p>
        </div>
      </div>
    `;

    const result = await sendNotificationEmail(user.email, subject, htmlContent);

    res.json({ success: true, previewUrl: result.previewUrl });
  } catch (error: any) {
    console.error("Notify assignment error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
