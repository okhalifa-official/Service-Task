import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { GatewayService } from './gateway.service';

@Controller('course')
export class CourseController {
  constructor(private readonly gateway: GatewayService) {}

  @Get('all')
  getAll() { return this.gateway.forward('course', 'GET', '/all'); }

  @Get(':id')
  getOne(@Param('id') id: string) { return this.gateway.forward('course', 'GET', `/${encodeURIComponent(id)}`); }

  @Post()
  create(@Body() body: unknown) { return this.gateway.forward('course', 'POST', '', body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) { return this.gateway.forward('course', 'PUT', `/${encodeURIComponent(id)}`, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.gateway.forward('course', 'DELETE', `/${encodeURIComponent(id)}`); }
}
