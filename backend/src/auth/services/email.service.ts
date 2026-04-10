import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST', 'mailpit');
    const port = Number(this.configService.get<number>('SMTP_PORT', 1025));
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    const config: any = {
      host,
      port,
      secure: port === 465,
      connectionTimeout: 10000,
      tls: {
        rejectUnauthorized: false,
      },
    };

    // Disable STARTTLS for Mailpit or non-secure ports to prevent timeouts
    if (port === 1025 || port === 587 || host === 'mailpit') {
      config.ignoreTLS = true;
    }

    if (user && pass) {
      config.auth = { user, pass };
    }

    this.transporter = nodemailer.createTransport(config);
  }

  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:3001',
    );
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: this.configService.get<string>('SMTP_USER', 'noreply@igg.hooppul.codes'),
      to: email,
      subject: 'Password Reset Request - Informatics Go Green',
      html: `
        <h1>Password Reset Request</h1>
        <p>You have requested to reset your password.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
        <hr>
        <p>Informatics Go Green Team</p>
      `,
    };

    try {
      this.logger.log(`Sending password reset email to ${email}`);
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}: ${error.message}`);
      throw error;
    }
  }
}
