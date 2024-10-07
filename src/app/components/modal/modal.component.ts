import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss'
})
export class ModalComponent {

  @Output() confirm = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();
  @Input() isOpen = false;
  @Input() title = 'Modal Title';
  @Input() body = 'Modal Body';

  close() {
    this.closeModal.emit();
  }

  onSubmit() {
    this.confirm.emit();
  }
}
