import { HttpException, Injectable } from '@nestjs/common';
import { CourseDTO } from './dto/course.dto.js';
import { UpdateCourseDTO } from './dto/update-course.dto.js';
import { CourseLogger } from './course.logger.js';
import { DatabaseService } from '../database.js';

@Injectable()
export class CourseService {
    constructor(
        private readonly courseLogger: CourseLogger,
        private readonly db: DatabaseService,
    ) {}

    private get courses() {
        return this.db.collection<CourseDTO>('courses');
    }

    async getAllCourses() {
        this.courseLogger.log('Retrieving all courses');
        return this.courses.find({}, { projection: { _id: 0 } }).sort({ id: 1 }).toArray();
    }

    async getById(id: number) {
        const course = await this.courses.findOne({ id }, { projection: { _id: 0 } });
        if (!course) {
            this.courseLogger.log(`Course not found: ${id}`);
            throw new HttpException('Course not found', 404);
        }
        this.courseLogger.log(`Course retrieved: ${course.name}`);
        return course;
    }

    async createCourse(courseDto: CourseDTO) {
        if (!courseDto.name || courseDto.price === undefined) {
            this.courseLogger.log('Name and price are required');
            throw new HttpException('Name and price are required', 400);
        }

        const newCourse: CourseDTO = {
            id: await this.db.nextId('courses'),
            name: courseDto.name,
            price: courseDto.price
        };

        // insertOne adds _id to the object it is given, so insert a copy.
        await this.courses.insertOne({ ...newCourse });
        this.courseLogger.log(`Course created: ${newCourse.name}`);
        return newCourse;
    }

    async updateCourse(id: number, courseDto: UpdateCourseDTO) {
        const { name, price } = courseDto;
        const changes = Object.fromEntries(
            Object.entries({ name, price }).filter(([, value]) => value !== undefined),
        );
        if (Object.keys(changes).length === 0) {
            throw new HttpException('Provide name or price to update', 400);
        }

        const updated = await this.courses.findOneAndUpdate(
            { id },
            { $set: changes },
            { returnDocument: 'after', projection: { _id: 0 } },
        );
        if (!updated) {
            this.courseLogger.log(`Course not found for update: ${id}`);
            throw new HttpException('Course not found', 404);
        }

        this.courseLogger.log(`Course updated: ${updated.name}`);
        return updated;
    }

    async deleteCourse(id: number){
        const result = await this.courses.deleteOne({ id });
        if (result.deletedCount === 0) {
            this.courseLogger.log(`Course not found for deletion: ${id}`);
            throw new HttpException('Course not found', 404);
        }
        this.courseLogger.log(`Course deleted: ${id}`);
        return { message: 'Course deleted successfully' };
    }

}
