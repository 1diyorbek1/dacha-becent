import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('webhook/telegram')
  async telegramWebhook(@Body() body: any) {
    return this.appService.handleTelegramWebhook(body);
  }

  @Get('api/dachalar')
  findAll() {
    return this.appService.findAll();
  }

  @Post('api/dachalar')
  create(@Body() data: any) {
    return this.appService.create(data);
  }

  @Get('api/dachalar/settings')
  getSettings() {
    return this.appService.getSettings();
  }

  @Put('api/dachalar/settings')
  updateSettings(@Body() data: any) {
    return this.appService.updateSettings(data);
  }

  @Put('api/dachalar/user/profile')
  updateUserProfile(@Body() body: { phone: string, data: any }) {
    return this.appService.updateUserProfile(body.phone, body.data);
  }

  @Put('api/dachalar/:id/story')
  updateDachaStory(@Param('id') id: string, @Body() body: { storyUrl: string }) {
    return this.appService.updateDachaStory(id, body.storyUrl);
  }

  @Post('api/dachalar/:id/story/like')
  toggleStoryLike(@Param('id') id: string, @Body() body: { phone: string }) {
    return this.appService.toggleStoryLike(id, body.phone);
  }

  @Post('api/dachalar/:id/review')
  addReview(@Param('id') id: string, @Body() body: { phone: string; rating: number; text: string }) {
    return this.appService.addReview(id, body.phone, body.rating, body.text);
  }

  @Delete('api/dachalar/:id/review/:index')
  deleteReview(@Param('id') id: string, @Param('index') index: number) {
    return this.appService.deleteReview(id, index);
  }

  @Post('api/dachalar/auth/request-code')
  requestCode(@Body() body: { name: string, surname: string, phone: string, role: string }) {
    return this.appService.requestCode(body.name, body.surname, body.phone, body.role);
  }

  @Post('api/dachalar/auth/verify-code')
  verifyCode(@Body() body: { phone: string, code: string }) {
    return this.appService.verifyCode(body.phone, body.code);
  }

  @Get('api/dachalar/admin/users')
  findAllUsers() {
    return this.appService.findAllUsers();
  }

  @Post('api/dachalar/bookings')
  createBooking(@Body() data: any) {
    return this.appService.createBooking(data);
  }

  @Get('api/dachalar/admin/bookings')
  findAllBookings() {
    return this.appService.findAllBookings();
  }

  @Put('api/dachalar/:id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.appService.update(id, data);
  }

  @Delete('api/dachalar/:id')
  remove(@Param('id') id: string) {
    return this.appService.remove(id);
  }
}
