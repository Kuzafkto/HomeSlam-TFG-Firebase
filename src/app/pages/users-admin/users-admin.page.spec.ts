import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersAdminPage } from './users-admin.page';

describe('UsersAdminPage', () => {
  let component: UsersAdminPage;
  let fixture: ComponentFixture<UsersAdminPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(UsersAdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
