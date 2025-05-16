import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../commands/create-user.command';
import { ClientKafka } from '@nestjs/microservices';
import { UserService } from '../user.service';
import { Inject } from '@nestjs/common';

@CommandHandler(CreateUserCommand)
export class CreateUseHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userService: UserService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka,
  ) {}

  async execute(command: CreateUserCommand) {
    const user = await this.userService.create(command.dto);

    // Send Kafka & wait response from user-notification-service
    const response = await new Promise((resolve, reject) => {
      const subcription = this.kafkaClient
        .send('user.created', user)
        .subscribe({
          next: (result) => {
            resolve(result);
            subcription.unsubscribe();
          },
          error: (err) => {
            reject(err instanceof Error ? err : new Error(String(err)));
          },
        });
    });

    return response;
  }
}
