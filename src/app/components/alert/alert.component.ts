import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss'
})
export class AlertComponent {

  @Input() showAlert: boolean = false;
  @Input() alertType: string = '';
  @Input() alertMessage: string = '';

  ngOnInit(): void {
    if (this.showAlert) {
      setTimeout(() => {
        this.showAlert = false;
      }, 2000);
    }
  }
}
