import { IsString, Min, MinLength } from 'class-validator'; 

export class CourseDTO {
    id: number;

    @IsString()
    @MinLength(1, { message: 'Name must be at least 1 character long' })
    name: string;
    
    @Min(0, { message: 'Price must be a non-negative number' })
    price: number;
}