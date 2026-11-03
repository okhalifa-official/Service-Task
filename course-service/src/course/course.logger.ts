import { Injectable } from "@nestjs/common";

@Injectable()
export class CourseLogger {
  log(message: string) {
    console.log(`[CourseService - Log] ${message}`);
  }
}