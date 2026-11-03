import { Controller, Get, Param, ParseIntPipe, Post, Body, Put, Delete } from '@nestjs/common';
import { CourseService } from './course.service.js';
import { CourseDTO } from './dto/course.dto.js';
import { UpdateCourseDTO } from './dto/update-course.dto.js';

@Controller('course')
export class CourseController {
    constructor(private readonly courseService: CourseService) {}

    // GET /course/all
    @Get('all')
    getAllCourses(){
        return this.courseService.getAllCourses();
    }

    // GET /course/:id
    @Get(':id')
    getCourseById(@Param('id', ParseIntPipe) id: number) {
        return this.courseService.getById(id);
    }

    // POST /course
    @Post()
    createCourse(@Body() courseDto: CourseDTO) {
        return this.courseService.createCourse(courseDto);
    }

    // PUT /course/:id
    @Put(':id')
    updateCourse(@Param('id', ParseIntPipe) id: number, @Body() courseDto: UpdateCourseDTO) {
        return this.courseService.updateCourse(id, courseDto);
    }

    // DELETE /course/:id
    @Delete(':id')
    deleteCourse(@Param('id', ParseIntPipe) id: number){
        return this.courseService.deleteCourse(id);
    }
}
