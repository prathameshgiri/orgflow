import { Router } from "express";
import { sendNotificationEmail, buildOrgManEmail } from "../utils/email";
import { AuthenticatedRequest } from "../middleware/auth";

const router = Router();

router.post("/assignment", async (req, res) => {
  try {
    const { assigneeId, type, itemTitle, itemDescription, linkUrl } = req.body;
    
    if (!assigneeId) {
      return res.status(400).json({ error: "Assignee ID is required" });
    }

    const supabase = (req as AuthenticatedRequest).supabase;
    if (!supabase) {
      return res.status(500).json({ error: "Supabase client not initialized" });
    }
    
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
    
    const messageHtml = `
      <p style="font-size: 16px; color: #333;">Hi <strong>${user.full_name || 'Team Member'}</strong>,</p>
      <p style="font-size: 16px; color: #333;">A new <strong>${type.toLowerCase()}</strong> has been assigned to you.</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-left: 4px solid #4f46e5; margin: 24px 0; border-radius: 4px;">
        <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">${itemTitle}</h3>
        <p style="color: #475569; white-space: pre-wrap; margin-bottom: 0;">${itemDescription || 'No description provided.'}</p>
      </div>
    `;

    const htmlContent = buildOrgManEmail(
      "New Assignment Notification",
      messageHtml,
      linkUrl || 'http://localhost:8080/dashboard',
      `View ${type}`
    );

    const result = await sendNotificationEmail(user.email, subject, htmlContent);

    res.json({ success: true, messageId: result.messageId });
  } catch (error: any) {
    console.error("Notify assignment error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
