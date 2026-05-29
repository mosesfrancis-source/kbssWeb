import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <!-- Hero -->
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/home">Home</a>
          <span>›</span>
          <span>About Us</span>
        </div>
        <h1>About K.B.S.S</h1>
        <p>Our history, vision, and the values that guide everything we do.</p>
      </div>
    </section>

    <!-- History Timeline -->
    <section class="about-history">
      <div class="container">
        <div class="section-header">
          <span class="section-tag"><mat-icon>history</mat-icon> Our Journey</span>
          <h2>A Legacy of Excellence</h2>
        </div>
        <div class="timeline">
          @for (item of timeline; track item.year) {
            <div class="timeline-item">
              <div class="timeline-marker">
                <span class="timeline-year">{{ item.year }}</span>
              </div>
              <div class="timeline-content card">
                <h3>{{ item.title }}</h3>
                <p>{{ item.desc }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Vision Mission Motto -->
    <section class="vmm-section">
      <div class="container">
        <div class="vmm-grid">
          @for (item of vmm; track item.title) {
            <div class="vmm-card" [class]="'vmm-' + item.type">
              <div class="vmm-icon"><mat-icon>{{ item.icon }}</mat-icon></div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.content }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Core Values -->
    <section class="values-section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag"><mat-icon>stars</mat-icon> Our Principles</span>
          <h2>Core Values</h2>
        </div>
        <div class="values-grid">
          @for (v of values; track v.title) {
            <div class="value-card card card-hover">
              <span class="value-num">{{ $index + 1 | number:'2.0' }}</span>
              <h4>{{ v.title }}</h4>
              <p>{{ v.desc }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- Leadership -->
    <section class="leadership-section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag"><mat-icon>people</mat-icon> Our Leadership</span>
          <h2>School Leadership</h2>
        </div>
        <div class="leadership-grid">
          @for (leader of leadership; track leader.name) {
            <div class="leader-card card card-hover">
              <div class="leader-photo-wrap">
                <img [src]="leader.photo" [alt]="leader.name"
                     onerror="this.src='assets/images/avatar-placeholder.png'">
              </div>
              <h4>{{ leader.name }}</h4>
              <span class="leader-role">{{ leader.role }}</span>
              <p>{{ leader.bio }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  timeline = [
    { year: '1979', title: 'School Founded', desc: 'Kissi Bendu Secondary School was established in Koindu Town to provide quality secondary education to the Kailahun District community.' },
    { year: '1985', title: 'First WAEC Class', desc: 'Our inaugural WAEC class achieved remarkable results, setting the tone for decades of academic excellence.' },
    { year: '1995', title: 'Campus Expansion', desc: 'Major infrastructure development including additional classrooms, a science laboratory, and an expanded library.' },
    { year: 2005, title: 'Post-War Rebuilding', desc: 'After the Sierra Leone Civil War, K.B.S.S led community recovery through education, rebuilding stronger than ever.' },
    { year: '2015', title: 'Digital Initiative', desc: 'Launch of computer literacy programs and digital learning tools for students in Kailahun District.' },
    { year: '2024', title: 'Digital Portal Launch', desc: 'Launch of the K.B.S.S Academic Web Portal, bringing school management into the 21st century.' },
  ];

  vmm = [
    { type: 'vision', icon: 'visibility', title: 'Our Vision', content: 'To be a centre of excellence that produces well-rounded, morally upright, and intellectually empowered citizens who contribute positively to the development of Sierra Leone and the world.' },
    { type: 'mission', icon: 'flag', title: 'Our Mission', content: 'To provide quality, accessible, and inclusive secondary education through qualified teachers, modern facilities, and a supportive learning environment that nurtures every student\'s potential.' },
    { type: 'motto', icon: 'format_quote', title: 'School Motto', content: '"Knowledge, Service, and Progress" — The guiding principle that inspires every student and teacher at Kissi Bendu Secondary School.' },
  ];

  values = [
    { title: 'Integrity', desc: 'Honesty, transparency, and ethical conduct in all we do.' },
    { title: 'Excellence', desc: 'Striving for the highest standards in academics, sports, and character.' },
    { title: 'Respect', desc: 'Treating every member of our community with dignity and respect.' },
    { title: 'Community', desc: 'Serving and uplifting the broader Koindu Town community.' },
    { title: 'Perseverance', desc: 'Encouraging students to persist through challenges to reach their goals.' },
    { title: 'Innovation', desc: 'Embracing new ideas, technologies, and approaches to teaching and learning.' },
  ];

  leadership = [
    { name: 'The Principal', role: 'School Principal', photo: 'assets/images/principal.jpg', bio: 'Leading K.B.S.S with vision and dedication, committed to academic excellence and community development.' },
    { name: 'Vice Principal (Academics)', role: 'VP — Academics', photo: 'assets/images/vp-academics.jpg', bio: 'Overseeing curriculum delivery, teacher development, and student academic welfare.' },
    { name: 'Vice Principal (Admin)', role: 'VP — Administration', photo: 'assets/images/vp-admin.jpg', bio: 'Managing school operations, records, admissions, and administrative functions.' },
    { name: 'Head of Studies', role: 'Head of Studies', photo: 'assets/images/head-studies.jpg', bio: 'Coordinating timetables, examinations, and academic planning for all classes.' },
  ];
}
