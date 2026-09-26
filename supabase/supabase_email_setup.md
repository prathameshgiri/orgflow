# Supabase Email Verification & Webhook Setup

Follow these steps to configure your ORG MAN emails in Supabase.

## 1. Authentication Email Templates
Supabase handles user verification directly. You need to paste this custom HTML into your Supabase Dashboard to make the verification emails match the ORG MAN branding.

**Go to:** Supabase Dashboard -> Authentication -> Email Templates -> Confirm signup

**Copy and paste this HTML code into the "Message Body" field:**

```html
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Inter', -apple-system, sans-serif; }
  .wrapper { width: 100%; table-layout: fixed; background-color: #f4f4f5; padding: 40px 0; }
  .main { background-color: #ffffff; margin: 0 auto; width: 100%; max-width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
  .header { background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); padding: 32px 40px; text-align: center; }
  .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 2px; }
  .content { padding: 40px; color: #3f3f46; font-size: 16px; line-height: 1.6; }
  .button-container { text-align: center; margin: 32px 0; }
  .button { background-color: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; display: inline-block; }
  .footer { background-color: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
  .footer p { color: #64748b; font-size: 13px; margin: 0; }
</style>
</head>
<body>
  <div class="wrapper">
    <table class="main" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td class="header"><h1>ORG MAN</h1></td>
      </tr>
      <tr>
        <td class="content">
          <h2 style="color: #18181b; margin-top:0;">Verify your email address</h2>
          <p>Hi there,</p>
          <p>Welcome to ORG MAN! Please click the button below to verify your email address and activate your account.</p>
          
          <div class="button-container">
            <a href="{{ .ConfirmationURL }}" class="button">Verify Email Address</a>
          </div>
          
          <p style="margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
          <p style="margin-top: 20px; margin-bottom: 0;">Thanks,<br>The ORG MAN Team</p>
        </td>
      </tr>
      <tr>
        <td class="footer">
          <p>This is an automated message, please do not reply.</p>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>
```

*(You can copy this exact same template for the **"Reset Password"** tab, just change the text to "Reset Password" instead of "Verify your email address")*


## 2. SQL Triggers for Activity Automation (Optional Webhooks)
If you want Supabase to automatically ping your backend API on every database activity (like when an Incident is created), you can run this SQL code in the **Supabase SQL Editor**. 

*(Note: In development, your frontend is currently calling the API directly. Use this SQL only if your backend is hosted publicly, like on Heroku, Render, or Vercel.)*

```sql
-- Enable the HTTP extension (Required to make webhooks from Postgres)
CREATE EXTENSION IF NOT EXISTS http;

-- 1. Create a function that sends a webhook to your backend
CREATE OR REPLACE FUNCTION notify_backend_on_activity()
RETURNS trigger AS $$
DECLARE
  payload json;
  request_url text := 'https://your-production-backend.com/api/notify/webhook'; -- Change to your hosted backend URL
BEGIN
  -- Build the JSON payload
  payload := json_build_object(
    'table_name', TG_TABLE_NAME,
    'action', TG_OP,
    'record', row_to_json(NEW)
  );

  -- Send POST request to backend (Don't wait for response to avoid blocking)
  PERFORM http_post(
    request_url,
    payload::text,
    'application/json'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to Incidents
DROP TRIGGER IF EXISTS trigger_incident_activity ON public.incidents;
CREATE TRIGGER trigger_incident_activity
  AFTER INSERT OR UPDATE ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION notify_backend_on_activity();

-- 3. Attach the trigger to Tasks
DROP TRIGGER IF EXISTS trigger_task_activity ON public.tasks;
CREATE TRIGGER trigger_task_activity
  AFTER INSERT OR UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_backend_on_activity();

-- 4. Attach the trigger to Project Tasks
DROP TRIGGER IF EXISTS trigger_ptask_activity ON public.project_tasks;
CREATE TRIGGER trigger_ptask_activity
  AFTER INSERT OR UPDATE ON public.project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_backend_on_activity();
```
