import { IsArray, IsNotEmpty, MinLength } from "class-validator";

export class TeamDto {
    @IsArray()
    @IsNotEmpty()
    userIds: string[];
}