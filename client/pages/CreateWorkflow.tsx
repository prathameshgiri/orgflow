import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Zap, Mail, RefreshCw, Save, Trash2, ShieldAlert } from "lucide-react";
import { useOrganization } from "../hooks/useOrganization";
import { supabase } from "../../shared/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function CreateWorkflow() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("incident_created");
  
  // Basic condition
  const [conditionField, setConditionField] = useState("priority");
  const [conditionValue, setConditionValue] = useState("p1_critical");
  const [enableCondition, setEnableCondition] = useState(false);
  
  // Action
  const [actionType, setActionType] = useState("send_email");
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("New {{priority}} Incident: {{title}}");
  const [emailBody, setEmailBody] = useState("A new incident has been created.\n\nTitle: {{title}}\nPriority: {{priority}}\n\nPlease review immediately.");
  
  const [updateTable, setUpdateTable] = useState("incidents");
  const [updateStatus, setUpdateStatus] = useState("in_progress");

  const handleSave = async () => {
    if (!orgId) return;
    if (!name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Create Workflow
      const { data: wfData, error: wfError } = await supabase
        .from("workflows")
        .insert([{
          organization_id: orgId,
          name,
          description,
          trigger_event: triggerEvent,
          is_active: true
        }])
        .select()
        .single();

      if (wfError) throw wfError;

      // 2. Create Rule
      let conditionJson = {};
      if (enableCondition && conditionField && conditionValue) {
        conditionJson = { [conditionField]: conditionValue };
      }

      let actionPayload = {};
      if (actionType === 'send_email') {
        actionPayload = { to: emailTo, subject: emailSubject, body: emailBody };
      } else if (actionType === 'update_status') {
        actionPayload = { target_table: updateTable, status: updateStatus };
      }

      const { error: ruleError } = await supabase
        .from("automation_rules")
        .insert([{
          organization_id: orgId,
          workflow_id: wfData.id,
          condition_json: conditionJson,
          action_type: actionType,
          action_payload: actionPayload,
          step_order: 1
        }]);

      if (ruleError) throw ruleError;

      toast({ title: "Automation created successfully! 🚀" });
      navigate("/dashboard/workflows");
    } catch (error: any) {
      console.error(error);
      toast({ title: "Failed to create workflow", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors text-zinc-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Create Automation</h1>
          <p className="text-sm text-zinc-500">Configure a new trigger and action sequence.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader>
            <CardTitle>1. Workflow Details</CardTitle>
            <CardDescription>Name your automation and select the trigger event.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Workflow Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Critical Incident Alert" 
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-amber-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Trigger Event</label>
                <select 
                  value={triggerEvent}
                  onChange={(e) => setTriggerEvent(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <option value="incident_created">Incident Created</option>
                  <option value="request_created">Service Request Created</option>
                  <option value="task_created">Task Created</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What does this workflow do?" 
                className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-zinc-800 dark:bg-zinc-950"
              />
            </div>
          </CardContent>
        </Card>

        {/* Condition */}
        <Card className="border-t-4 border-t-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>2. Conditions (Optional)</CardTitle>
              <CardDescription>Only run this automation if specific conditions are met.</CardDescription>
            </div>
            <button 
              onClick={() => setEnableCondition(!enableCondition)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${enableCondition ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}
            >
              {enableCondition ? 'Enabled' : 'Add Condition'}
            </button>
          </CardHeader>
          {enableCondition && (
            <CardContent>
              <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span className="text-sm font-medium text-zinc-500">IF</span>
                <select 
                  value={conditionField}
                  onChange={(e) => setConditionField(e.target.value)}
                  className="flex h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <option value="priority">Priority</option>
                  <option value="status">Status</option>
                </select>
                <span className="text-sm font-medium text-zinc-500">EQUALS</span>
                <input 
                  type="text" 
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                  placeholder="e.g. p1_critical" 
                  className="flex h-9 rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Action */}
        <Card className="border-t-4 border-t-emerald-500">
          <CardHeader>
            <CardTitle>3. Action</CardTitle>
            <CardDescription>What should happen when this workflow triggers?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <button 
                onClick={() => setActionType('send_email')}
                className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${actionType === 'send_email' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-900'}`}
              >
                <Mail className={`mx-auto mb-2 ${actionType === 'send_email' ? 'text-emerald-500' : 'text-zinc-400'}`} />
                <h4 className={`font-medium ${actionType === 'send_email' ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'}`}>Send Email</h4>
              </button>
              <button 
                onClick={() => setActionType('update_status')}
                className={`flex-1 p-4 rounded-lg border-2 text-center transition-all ${actionType === 'update_status' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-emerald-200 dark:hover:border-emerald-900'}`}
              >
                <RefreshCw className={`mx-auto mb-2 ${actionType === 'update_status' ? 'text-emerald-500' : 'text-zinc-400'}`} />
                <h4 className={`font-medium ${actionType === 'update_status' ? 'text-emerald-700 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'}`}>Update Status</h4>
              </button>
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-4">
              {actionType === 'send_email' ? (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded flex items-start gap-2 text-sm mb-4">
                    <ShieldAlert className="shrink-0 mt-0.5" size={16} />
                    <p><strong>Note:</strong> In this demo, emails are routed to a secure Ethereal inbox. Check backend logs for the magic viewing link after triggering!</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">To (Email Address)</label>
                    <input 
                      type="email" 
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="admin@orgtask.com" 
                      className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <input 
                      type="text" 
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    />
                    <p className="text-xs text-zinc-500">You can use variables like {'{{title}}'}, {'{{priority}}'}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Body</label>
                    <textarea 
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="flex min-h-[120px] w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Target Record</label>
                      <select 
                        value={updateTable}
                        onChange={(e) => setUpdateTable(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                      >
                        <option value="incidents">The triggering Incident</option>
                        <option value="service_requests">The triggering Request</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">New Status</label>
                      <select 
                        value={updateStatus}
                        onChange={(e) => setUpdateStatus(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                      >
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-amber-500 text-white shadow hover:bg-amber-600 h-10 px-6 disabled:opacity-50"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Automation
          </button>
        </div>
      </div>
    </div>
  );
}
