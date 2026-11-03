import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { GatewayService } from './gateway.service';

@Controller('user')
export class UserController {
  constructor(private readonly gateway: GatewayService) {}

  @Get()
  getAll() { return this.gateway.forward('user', 'GET'); }

  @Get(':id')
  getOne(@Param('id') id: string) { return this.gateway.forward('user', 'GET', `/${encodeURIComponent(id)}`); }

  @Post()
  create(@Body() body: unknown) { return this.gateway.forward('user', 'POST', '', body); }

  // Must stay above PUT :id, otherwise "login" is matched as an id.
  @Put('login')
  login(@Body() body: unknown) { return this.gateway.forward('user', 'PUT', '/login', body); }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: unknown) { return this.gateway.forward('user', 'PUT', `/${encodeURIComponent(id)}`, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.gateway.forward('user', 'DELETE', `/${encodeURIComponent(id)}`); }
}
