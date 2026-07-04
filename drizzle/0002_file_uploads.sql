-- Migration: Add uploads table for Universal File Ingestion (RBAC Portals)
CREATE TABLE IF NOT EXISTS `uploads` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `fileName` varchar(512) NOT NULL,
  `fileUrl` text,
  `fileType` enum('curriculum_pdf','parent_iep_report','student_homework') NOT NULL,
  `mimeType` varchar(128),
  `fileSizeBytes` int,
  `status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
  `aiMetadata` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `uploads_id` PRIMARY KEY(`id`)
);
