import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

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


  constructor(
    private titleService: Title,
  ) {
    titleService.setTitle('UrbanKicks - Register')
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
  }

}
