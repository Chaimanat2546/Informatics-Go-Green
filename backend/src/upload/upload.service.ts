import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  private readonly profileUploadPath: string;
  private readonly wasteMaterialUploadPath: string;

  constructor(private configService: ConfigService) {
    this.profileUploadPath = path.join(process.cwd(), 'uploads', 'profiles');
    this.wasteMaterialUploadPath = path.join(process.cwd(), 'uploads', 'waste-materials');
    this.ensureUploadDirectories();
  }

  private ensureUploadDirectories(): void {
    if (!fs.existsSync(this.profileUploadPath)) {
      fs.mkdirSync(this.profileUploadPath, { recursive: true });
    }
    if (!fs.existsSync(this.wasteMaterialUploadPath)) {
      fs.mkdirSync(this.wasteMaterialUploadPath, { recursive: true });
    }
  }

  private sanitizeFilename(filename: string): string {
    // Remove path traversal attempts and special characters
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  }

  // Profile Picture Methods
  async saveProfilePicture(
    file: Express.Multer.File,
  ): Promise<{ url: string; filename: string }> {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.profileUploadPath, filename);

    await fs.promises.writeFile(filePath, file.buffer);

    const apiUrl = this.configService.get<string>(
      'API_URL',
      'http://localhost:3001',
    );
    const url = `${apiUrl}/uploads/profiles/${filename}`;

    return { url, filename };
  }

  async deleteProfilePicture(filename: string): Promise<void> {
    const sanitized = this.sanitizeFilename(filename);
    const filePath = path.join(this.profileUploadPath, sanitized);
    
    // Security check: ensure path is within upload directory
    if (!filePath.startsWith(this.profileUploadPath)) {
      throw new BadRequestException('Invalid filename');
    }
    
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  // Waste Material Picture Methods
  async saveWasteMaterialPicture(
    file: Express.Multer.File,
  ): Promise<{ url: string; filename: string }> {
    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG and PNG files are allowed');
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 5MB');
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
      throw new BadRequestException('Invalid file extension');
    }

    const filename = `waste-${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.wasteMaterialUploadPath, filename);

    await fs.promises.writeFile(filePath, file.buffer);

    const apiUrl = this.configService.get<string>(
      'API_URL',
      'http://localhost:3001',
    );
    const url = `${apiUrl}/uploads/waste-materials/${filename}`;

    return { url, filename };
  }

  async deleteWasteMaterialPicture(filename: string): Promise<void> {
    // Security: sanitize filename to prevent path traversal
    const sanitized = this.sanitizeFilename(filename);
    const filePath = path.join(this.wasteMaterialUploadPath, sanitized);
    
    // Ensure the resolved path is still within the upload directory
    if (!filePath.startsWith(this.wasteMaterialUploadPath)) {
      throw new BadRequestException('Invalid filename');
    }

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  extractFilenameFromUrl(url: string): string | null {
    if (!url) return null;
    try {
      const urlObj = new URL(url);
      const parts = urlObj.pathname.split('/');
      const filename = parts[parts.length - 1];
      return this.sanitizeFilename(filename);
    } catch {
      // If not a valid URL, try simple split
      const parts = url.split('/');
      return this.sanitizeFilename(parts[parts.length - 1]);
    }
  }
}
