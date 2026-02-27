import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequirementAiComponent } from './requirement-ai.component';

describe('RequirementAiComponent', () => {
  let component: RequirementAiComponent;
  let fixture: ComponentFixture<RequirementAiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequirementAiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RequirementAiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
