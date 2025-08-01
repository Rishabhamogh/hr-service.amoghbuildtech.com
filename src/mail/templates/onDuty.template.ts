export const onDutyTemplates = {
  requestSubmitted: {
    subject: 'OnDuty Request - {{employeeName}} - {{fromDate}}',
    template: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <p>Dear <strong>{{recipientName}}</strong>,</p>

        <p>An OnDuty request has been submitted with the following details:</p>

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <p><strong>Employee:</strong> {{employeeName}} </p>
          <p><strong>Type:</strong> {{type}}</p>
          <p><strong>From Date:</strong> {{fromDate}}</p>
          <p><strong>To Date:</strong> {{toDate}}</p>
          <p><strong>Reason:</strong> {{reason}}</p>
        </div>

        <p>Please review the request at your earliest convenience.</p>

        <p>Best regards,<br>
        HR Team</p>
      </div>
    `
  },

  requestApproved: {
    subject: 'OnDuty Approved - {{employeeName}} - {{fromDate}}',
    template: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <p>Dear <strong>{{employeeName}}</strong>,</p>

        <p>Your OnDuty request has been approved:</p>

        <div style="background-color: #e7f7e7; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <p><strong>Type:</strong> {{type}}</p>
          <p><strong>From Date:</strong> {{fromDate}}</p>
          <p><strong>To Date:</strong> {{toDate}}</p>
          <p><strong>Approved by:</strong> {{managerName}}</p>
        </div>

        <p>Best regards,<br>
        HR Team</p>
      </div>
    `
  },

  requestRejected: {
    subject: 'OnDuty Rejected - {{employeeName}} - {{fromDate}}',
    template: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <p>Dear <strong>{{employeeName}}</strong>,</p>

        <p>Your OnDuty request has been rejected:</p>

        <div style="background-color: #fff0f0; padding: 15px; border-radius: 5px; margin: 10px 0;">
          <p><strong>Type:</strong> {{type}}</p>
          <p><strong>From Date:</strong> {{fromDate}}</p>
          <p><strong>To Date:</strong> {{toDate}}</p>
          <p><strong>Rejected by:</strong> {{managerName}}</p>
          <p><strong>Reason:</strong> {{rejectionReason}}</p>
        </div>

        <p>Please contact your manager for more details.</p>

        <p>Best regards,<br>
        HR Team</p>
      </div>
    `
  }
};