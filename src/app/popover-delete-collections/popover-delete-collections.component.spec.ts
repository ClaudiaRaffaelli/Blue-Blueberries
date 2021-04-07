import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PopoverDeleteCollectionsComponent } from './popover-delete-collections.component';

describe('PopoverDeleteCollectionsComponent', () => {
  let component: PopoverDeleteCollectionsComponent;
  let fixture: ComponentFixture<PopoverDeleteCollectionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PopoverDeleteCollectionsComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PopoverDeleteCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
