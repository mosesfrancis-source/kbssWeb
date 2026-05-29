import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatIconModule, RouterLink,
  ],
  template: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/home">Home</a><span>›</span><span>Contact</span>
        </div>
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Reach out any time.</p>
      </div>
    </section>

    <section class="contact-section">
      <div class="container">
        <div class="contact-grid">
          <!-- Info cards -->
          <div class="contact-info">
            <h2>Get in Touch</h2>
            <p class="lead">Whether you have a question about admissions, academics, or school life — our team is here to help.</p>

            <div class="info-cards">
              @for (info of contactInfo; track info.title) {
                <div class="info-card card">
                  <div class="info-icon"><mat-icon>{{ info.icon }}</mat-icon></div>
                  <div>
                    <h4>{{ info.title }}</h4>
                    <p [innerHTML]="info.value"></p>
                  </div>
                </div>
              }
            </div>

            <!-- Map embed -->
            <div class="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3953.5!2d-10.9!3d8.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwMjcnMDAuMCJOIDEwwrA1NCcwMC4wIlc!5e0!3m2!1sen!2ssl!4v1"
                width="100%"
                height="250"
                style="border:0;border-radius:12px;"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                title="K.B.S.S Location Map"
              ></iframe>
            </div>
          </div>

          <!-- Contact form -->
          <div class="contact-form-wrap">
            @if (sent()) {
              <div class="success-msg card">
                <mat-icon>check_circle</mat-icon>
                <h3>Message Sent!</h3>
                <p>Thank you for contacting K.B.S.S. We will get back to you within 2 working days.</p>
                <button mat-raised-button color="primary" (click)="sent.set(false)">Send Another</button>
              </div>
            } @else {
              <div class="card form-card">
                <h3>Send a Message</h3>
                <form [formGroup]="form" (ngSubmit)="submit()" class="contact-form">
                  <div class="form-row">
                    <mat-form-field appearance="outline">
                      <mat-label>Your Name</mat-label>
                      <input matInput formControlName="name">
                      <mat-icon matPrefix>person</mat-icon>
                    </mat-form-field>

                    <mat-form-field appearance="outline">
                      <mat-label>Email Address</mat-label>
                      <input matInput type="email" formControlName="email">
                      <mat-icon matPrefix>email</mat-icon>
                    </mat-form-field>
                  </div>

                  <mat-form-field appearance="outline">
                    <mat-label>Subject</mat-label>
                    <input matInput formControlName="subject">
                    <mat-icon matPrefix>subject</mat-icon>
                  </mat-form-field>

                  <mat-form-field appearance="outline">
                    <mat-label>Message</mat-label>
                    <textarea matInput formControlName="message" rows="6"></textarea>
                    <mat-icon matPrefix>message</mat-icon>
                  </mat-form-field>

                  <button mat-raised-button color="primary" type="submit"
                          [disabled]="form.invalid || submitting()">
                    @if (submitting()) {
                      <mat-icon class="spin">refresh</mat-icon> Sending...
                    } @else {
                      <mat-icon>send</mat-icon> Send Message
                    }
                  </button>
                </form>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  submitting = signal(false);
  sent = signal(false);

  form = this.fb.group({
    name:    ['', [Validators.required, Validators.minLength(2)]],
    email:   ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(20)]],
  });

  contactInfo = [
    { icon: 'location_on', title: 'Address', value: 'Koindu Town, Kailahun District,<br>Eastern Province, Sierra Leone' },
    { icon: 'phone', title: 'Phone', value: '+232 76 000 000 / +232 78 000 000' },
    { icon: 'email', title: 'Email', value: 'info&#64;kbss.edu.sl' },
    { icon: 'schedule', title: 'Office Hours', value: 'Monday – Friday: 8:00 AM – 4:00 PM' },
  ];

  submit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    // In production, connect to a Cloud Function or EmailJS
    setTimeout(() => {
      this.submitting.set(false);
      this.sent.set(true);
      this.form.reset();
    }, 1500);
  }
}
