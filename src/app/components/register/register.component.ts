import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy {

  states: any[] = []
  districts: any[] = []

  subscription: Subscription = new Subscription

  constructor(
    private titleService: Title,
    private commonService: CommonService
  ) {
    titleService.setTitle('UrbanKicks - Register')
  }

  ngOnInit(): void {
    this.getStates();
  }

  getStates() {
    this.subscription.add(
      this.commonService.getStates().subscribe({
        next: (resp: any) => {
          this.states = resp?.data
        },
        error: (err: any) => {
          console.error(err);
        }
      })
    );
  }

  getDistricts(stateId: any) {
    this.subscription.add(
      this.commonService.getDistricts(stateId).subscribe({
        next: (resp: any) => {
          this.districts = resp?.data
        },
        error: (err: any) => {
          console.error(err);
        }
      })
    );
  }

  onStateSelect(event: any) {
    const selectedStateId = event.target.value;

    if (selectedStateId) {
      this.getDistricts(selectedStateId);
    } else {
      this.districts = [];
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
