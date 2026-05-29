import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, CommonModule, MatIconModule],
  template: `
    <footer class="footer">
      <div class="footer-main container">
        <div class="footer-brand">
          <div class="footer-logo">
            <img src="assets/images/kbss-badge.svg" alt="K.B.S.S" class="footer-badge"
                 onerror="this.style.display='none'">
            <div class="footer-school-info">
              <h3>Kissi Bendu Secondary School</h3>
              <p>Koindu Town, Kailahun District<br>Eastern Province, Sierra Leone</p>
            </div>
          </div>
          <p class="footer-tagline">
            "Empowering minds, building futures — one student at a time."
          </p>
          <div class="social-links">
            <a href="#" aria-label="Facebook" class="social-link">
              <mat-icon>facebook</mat-icon>
            </a>
            <a href="tel:+23276000000" aria-label="Phone" class="social-link">
              <mat-icon>phone</mat-icon>
            </a>
            <a href="mailto:info@kbss.edu.sl" aria-label="Email" class="social-link">
              <mat-icon>email</mat-icon>
            </a>
          </div>
        </div>

        <div class="footer-links-group">
          <h4>Quick Links</h4>
          <ul>
            <li><a routerLink="/home">Home</a></li>
            <li><a routerLink="/about">About Us</a></li>
            <li><a routerLink="/academics">Academics</a></li>
            <li><a routerLink="/admissions">Admissions</a></li>
            <li><a routerLink="/gallery">Gallery</a></li>
            <li><a routerLink="/news">News & Events</a></li>
          </ul>
        </div>

        <div class="footer-links-group">
          <h4>Portals</h4>
          <ul>
            <li><a routerLink="/auth/login">Student Portal</a></li>
            <li><a routerLink="/auth/login">Teacher Portal</a></li>
            <li><a routerLink="/auth/login">Admin Portal</a></li>
            <li><a routerLink="/contact">Contact Us</a></li>
          </ul>
        </div>

        <div class="footer-links-group">
          <h4>Contact</h4>
          <ul class="contact-list">
            <li>
              <mat-icon>location_on</mat-icon>
              <span>Koindu Town, Kailahun District, Sierra Leone</span>
            </li>
            <li>
              <mat-icon>phone</mat-icon>
              <a href="tel:+23276000000">+232 76 000 000</a>
            </li>
            <li>
              <mat-icon>email</mat-icon>
              <a href="mailto:info@kbss.edu.sl">info&#64;kbss.edu.sl</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="container footer-bottom-inner">
          <p>
            &copy; {{ year }} Kissi Bendu Secondary School — K.B.S.S.
            All rights reserved.
          </p>
          <p class="footer-built">
            Designed &amp; built by
            <span class="brand-mark">Moses Francis (Mojo)</span>
            &mdash; Former Student, K.B.S.S
          </p>
        </div>
      </div>
    </footer>
  `,
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  year = new Date().getFullYear();
}
