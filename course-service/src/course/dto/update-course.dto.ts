import { IsOptional, IsString, Min, MinLength } from 'class-validator';

export class UpdateCourseDTO {
    @IsOptional()
    @IsString()
    @MinLength(1, { message: 'Name must be at least 1 character long' })
    name?: string;

    @IsOptional()
    @Min(0, { message: 'Price must be a non-negative number' })
    price?: number;
}
