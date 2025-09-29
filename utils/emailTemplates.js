export const resetPasswordTemplate = (name, resetLink) => {
  return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafc; padding: 40px 15px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 30px; border: 1px solid #e5e7eb;">
    
    <!-- Title -->
    <h2 style="color: #4338ca; margin: 0 0 20px; font-size: 22px; text-align: center; font-weight: 600;">
      Password Reset Request
    </h2>

    <!-- Body -->
    <p style="font-size: 15px; margin: 0 0 15px;">Hi ${name},</p>
    <p style="font-size: 15px; margin: 0 0 25px;">
      You requested to reset your password. Click the button below to set a new password. 
      This link will expire in <strong>1 hour</strong>.
    </p>
    
    <!-- Button -->
    <p style="text-align: center; margin: 30px 0;">
      <a href="${resetLink}" style="
        background-color: #4338ca;
        color: #ffffff;
        padding: 12px 28px;
        text-decoration: none;
        border-radius: 9999px;
        font-size: 15px;
        font-weight: 600;
        display: inline-block;">
        Reset Password
      </a>
    </p>

    <!-- Note -->
    <p style="font-size: 13px; color: #555; margin: 0 0 15px;">
      If you did not request this, you can safely ignore this email.
    </p>
    <p style="font-size: 13px; margin: 0; color: #444;">
      Thanks,<br>
      <strong>The Support Team</strong>
    </p>
    
    <!-- Footer -->
    <div style="margin-top: 35px; text-align: center; font-size: 12px; color: #888;">
      © ${new Date().getFullYear()} Clustria
    </div>
  </div>
</div>
  `;
};

export const shareFileTemplate = (filename, fileLink) => {
  return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f9fafc; padding: 40px 15px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 10px; padding: 30px; border: 1px solid #e5e7eb;">
    
    <!-- Title -->
    <h2 style="color: #4338ca; margin: 0 0 20px; font-size: 22px; text-align: center; font-weight: 600;">
      File Shared with You
    </h2>

    <!-- Body -->
    <p style="font-size: 15px; margin: 0 0 15px;">
      Hi,
    </p>
    <p style="font-size: 15px; margin: 0 0 25px;">
      A file named <strong>${filename}</strong> has been shared with you. Click the button below to download it.
    </p>

    <!-- Button -->
    <p style="text-align: center; margin: 30px 0;">
      <a href="${fileLink}" style="
        background-color: #4338ca;
        color: #ffffff;
        padding: 12px 28px;
        text-decoration: none;
        border-radius: 9999px;
        font-size: 15px;
        font-weight: 600;
        display: inline-block;">
        Download File
      </a>
    </p>

    <!-- Note -->
    <p style="font-size: 13px; color: #555; margin: 0 0 15px;">
      If you were not expecting this email, you can safely ignore it.
    </p>
    <p style="font-size: 13px; margin: 0; color: #444;">
      Thanks,<br>
      <strong>The Clustria Team</strong>
    </p>

    <!-- Footer -->
    <div style="margin-top: 35px; text-align: center; font-size: 12px; color: #888;">
      © ${new Date().getFullYear()} Clustria
    </div>
  </div>
</div>
  `;
};
