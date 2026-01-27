import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: 1, description: 'Application specific code' })
  code: number;

  @ApiProperty({ example: 200, description: 'HTTP Status code' })
  status: number;

  @ApiProperty({ example: 'Thành công', description: 'Message' })
  message: string;

  data: T;

  @ApiProperty({
    required: false,
    description: 'Additional metadata (pagination, etc.)',
  })
  metadata?: any;

  constructor(code: number, status: number, message: string, data: T, metadata?: any) {
    this.code = code;
    this.status = status;
    this.message = message;
    this.data = data;
    this.metadata = metadata;
  }
}
