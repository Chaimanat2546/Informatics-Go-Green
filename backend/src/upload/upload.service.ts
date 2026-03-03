import { Injectable } from '@nestjs/common';
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
    // สร้างโฟลเดอร์ profiles
    if (!fs.existsSync(this.profileUploadPath)) {
      fs.mkdirSync(this.profileUploadPath, { recursive: true });
    }
    
    // สร้างโฟลเดอร์ waste-materials
    if (!fs.existsSync(this.wasteMaterialUploadPath)) {
      fs.mkdirSync(this.wasteMaterialUploadPath, { recursive: true });
    }
  }

  // Profile Picture Methods
  async saveProfilePicture(
    file: Express.Multer.File,
  ): Promise<{ url: string; filename: string }> {
    const fileExtension = path.extname(file.originalname);
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
    const filePath = path.join(this.profileUploadPath, filename);
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
      throw new Error('Only JPEG and PNG files are allowed');
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    const fileExtension = path.extname(file.originalname);
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
    const filePath = path.join(this.wasteMaterialUploadPath, filename);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  }

  extractFilenameFromUrl(url: string): string | null {
    if (!url) return null;
    const parts = url.split('/');
    return parts[parts.length - 1];
  }
}