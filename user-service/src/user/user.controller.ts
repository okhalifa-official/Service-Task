import { Body, Controller, Delete, Get, Param, Post, Put, ParseIntPipe } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserDTO } from './dto/user.dto.js';
import { UpdateUserDTO } from './dto/update-user.dto.js';

@Controller('user')
export class UserController {
constructor(private readonly userService: UserService) {}

// GET /user/all
@Get()
getAllUsers() {
  return this.userService.getAllUsers();
}

// GET /user/:id
@Get(':id')
getUserById(@Param('id', ParseIntPipe) id: number) {
  return this.userService.getById(id);
}

// POST /user
@Post()
createUser(@Body() userDto: UserDTO) {
  return this.userService.createUser(userDto);
}

// login
@Put('login')
login(@Body('email') email: string, @Body('password') password: string) {
  return this.userService.login(email, password);
}

// PUT /user/:id
@Put(':id')
updateUser(@Param('id', ParseIntPipe) id: number, @Body() userDto: UpdateUserDTO) {
  return this.userService.updateUser(id, userDto);
}


// DELETE /user/:id
@Delete(':id')
deleteUser(@Param('id', ParseIntPipe) id: number) {
  return this.userService.deleteUser(id);
}

}
