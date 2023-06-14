import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;
      return user;
      // TODO: Retornar el JWT de acceso
    } catch (e) {
      this.handleDBErrors(e);
      console.log(e);
    }
  }

  private handleDBErrors(errors: any): never {
    if (errors.code === '23505') throw new BadRequestException(errors.detail);

    console.log(errors);
    throw new InternalServerErrorException('Please check server logs ');
  }
}
