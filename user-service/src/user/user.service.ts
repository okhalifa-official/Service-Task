import { Injectable } from '@nestjs/common';
import { UserDTO } from './dto/user.dto.js';
import { UpdateUserDTO } from './dto/update-user.dto.js';
import { UserLogger } from './user.logger.js';
import { DatabaseService } from '../database.js';

@Injectable()
export class UserService {
    constructor(
        private readonly userLogger: UserLogger,
        private readonly db: DatabaseService,
    ) {}

    private get users() {
        return this.db.collection<UserDTO>('users');
    }

    async login(email: string, password: string) {
        if (!email || !password) {
            this.userLogger.log('Email and password are required');
            return { message: 'Email and password are required' };
        }

        email = email.trim();
        email = email.toLowerCase();

        const user = await this.users.findOne({ email, password }, { projection: { _id: 0 } });
        if (user) {
            this.userLogger.log(`User logged in: ${user.email}`);
            return { message: 'Login successful', user };
        } else {
            this.userLogger.log(`Invalid login attempt for email: ${email}`);
            return { message: 'Invalid email or password' };
        }
    }

    async createUser(userDto: UserDTO) {
        if (!userDto.name || !userDto.email || !userDto.password) {
            this.userLogger.log('Name, email, and password are required');
            return { message: 'Name, email, and password are required' };
        }

        userDto.email = userDto.email.trim();
        userDto.email = userDto.email.toLowerCase();

        const existingUser = await this.users.findOne({ email: userDto.email });
        if (existingUser) {
            this.userLogger.log(`Email already exists: ${userDto.email}`);
            return { message: 'Email already exists' };
        }

        const newUser: UserDTO = {
            id: await this.db.nextId('users'),
            name: userDto.name,
            email: userDto.email,
            password: userDto.password
        };

        // insertOne adds _id to the object it is given, so insert a copy.
        await this.users.insertOne({ ...newUser });
        this.userLogger.log(`User created: ${newUser.email}`);
        return { message: 'User created successfully', user: newUser };
    }

    async updateUser(id: number, userDto: UpdateUserDTO) {
        const user = await this.users.findOne({ id });
        if (!user) {
            this.userLogger.log(`User not found for update: ${id}`);
            return { message: 'User not found' };
        }

        if (userDto.email !== undefined) {
            userDto.email = userDto.email.trim();
            userDto.email = userDto.email.toLowerCase();

            const existingUser = await this.users.findOne({ email: userDto.email, id: { $ne: id } });
            if (existingUser) {
                this.userLogger.log(`Email already exists for update: ${userDto.email}`);
                return { message: 'Email already exists' };
            }
        }

        const { name, email, password } = userDto;
        const changes = Object.fromEntries(
            Object.entries({ name, email, password }).filter(([, value]) => value !== undefined),
        );
        if (Object.keys(changes).length === 0) {
            this.userLogger.log(`No fields provided for update: ${id}`);
            return { message: 'Provide name, email, or password to update' };
        }
        const updated = await this.users.findOneAndUpdate(
            { id },
            { $set: changes },
            { returnDocument: 'after', projection: { _id: 0 } },
        );
        this.userLogger.log(`User updated: ${updated?.email}`);
        return { message: 'User updated successfully', user: updated };
    }

    async getAllUsers() {
        this.userLogger.log('Retrieving all users');
        const users = await this.users.find({}, { projection: { _id: 0, password: 0 } }).sort({ id: 1 }).toArray();
        return { message: 'All users retrieved successfully', users };
    }

    async getById(id: number) {
        const user = await this.users.findOne({ id }, { projection: { _id: 0 } });
        if (!user) {
            this.userLogger.log(`User not found: ${id}`);
            return { message: 'User not found' };
        }
        this.userLogger.log(`User retrieved: ${user.email}`);
        return { message: 'User retrieved successfully', user };
    }

    async deleteUser(id: number) {
        const result = await this.users.deleteOne({ id });
        if (result.deletedCount === 0) {
            this.userLogger.log(`User not found for deletion: ${id}`);
            return { message: 'User not found' };
        }
        this.userLogger.log(`User deleted: ${id}`);
        return { message: 'User deleted successfully' };
    }

}
