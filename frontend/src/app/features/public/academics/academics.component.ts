import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-academics',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatIconModule, MatButtonModule, RouterLink],
  template: `
    <section class="page-hero">
      <div class="container">
        <div class="breadcrumb">
          <a routerLink="/home">Home</a><span>›</span><span>Academics</span>
        </div>
        <h1>Academics</h1>
        <p>Comprehensive curriculum designed to prepare students for national examinations and lifelong learning.</p>
      </div>
    </section>

    <section class="academics-main">
      <div class="container">
        <mat-tab-group mat-stretch-tabs="false" animationDuration="300ms">
          <!-- JSS Tab -->
          <mat-tab label="Junior Secondary (JSS 1–3)">
            <div class="tab-content">
              <div class="level-intro">
                <div class="level-badge">JSS</div>
                <div>
                  <h2>Junior Secondary School</h2>
                  <p>Grades JSS 1 through JSS 3 (Ages 12–15). A broad foundation covering all core disciplines.</p>
                </div>
              </div>
              <div class="subjects-grid">
                @for (subj of jssSubjects; track subj.name) {
                  <div class="subject-card card card-hover">
                    <div class="subj-icon"><mat-icon>{{ subj.icon }}</mat-icon></div>
                    <h4>{{ subj.name }}</h4>
                    <span class="badge badge-primary">{{ subj.division }}</span>
                    <p>{{ subj.desc }}</p>
                  </div>
                }
              </div>
            </div>
          </mat-tab>

          <!-- SSS Tab -->
          <mat-tab label="Senior Secondary (SSS 1–3)">
            <div class="tab-content">
              <div class="level-intro">
                <div class="level-badge sss">SSS</div>
                <div>
                  <h2>Senior Secondary School</h2>
                  <p>Grades SSS 1 through SSS 3 (Ages 15–18). Specialised tracks preparing for WAEC/BECE examinations.</p>
                </div>
              </div>

              @for (division of sssDivisions; track division.name) {
                <div class="division-section">
                  <div class="division-header">
                    <mat-icon>{{ division.icon }}</mat-icon>
                    <h3>{{ division.name }} Division</h3>
                  </div>
                  <div class="subjects-grid">
                    @for (subj of division.subjects; track subj.name) {
                      <div class="subject-card card card-hover">
                        <div class="subj-icon"><mat-icon>{{ subj.icon }}</mat-icon></div>
                        <h4>{{ subj.name }}</h4>
                        <span class="badge badge-primary">{{ division.name }}</span>
                        <p>{{ subj.desc }}</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </mat-tab>

          <!-- WAEC Tab -->
          <mat-tab label="WAEC Preparation">
            <div class="tab-content">
              <div class="waec-hero">
                <div class="waec-icon"><mat-icon>emoji_events</mat-icon></div>
                <h2>WAEC / BECE Preparation</h2>
                <p>Our dedicated exam preparation programme has consistently produced outstanding results in the West African Examinations Council (WAEC) exams.</p>
              </div>
              <div class="waec-stats">
                @for (stat of waecStats; track stat.label) {
                  <div class="waec-stat card">
                    <span class="stat-num">{{ stat.value }}</span>
                    <span class="stat-lbl">{{ stat.label }}</span>
                  </div>
                }
              </div>
              <div class="waec-strategies">
                <h3>Our Approach</h3>
                <div class="strategy-grid">
                  @for (s of strategies; track s.title) {
                    <div class="strategy-card card card-hover">
                      <mat-icon>{{ s.icon }}</mat-icon>
                      <h4>{{ s.title }}</h4>
                      <p>{{ s.desc }}</p>
                    </div>
                  }
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Calendar Tab -->
          <mat-tab label="Academic Calendar">
            <div class="tab-content">
              <h2>Academic Calendar 2025/2026</h2>
              <div class="calendar-grid">
                @for (term of calendar; track term.term) {
                  <div class="term-card card">
                    <div class="term-header">
                      <h3>{{ term.term }}</h3>
                      <span class="badge badge-primary">{{ term.dates }}</span>
                    </div>
                    <ul class="term-events">
                      @for (event of term.events; track event) {
                        <li><mat-icon>circle</mat-icon> {{ event }}</li>
                      }
                    </ul>
                  </div>
                }
              </div>
              <div class="calendar-download">
                <a mat-raised-button color="primary" href="assets/documents/academic-calendar-2025.pdf" download>
                  <mat-icon>download</mat-icon> Download Full Calendar (PDF)
                </a>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </div>
    </section>
  `,
  styleUrls: ['./academics.component.scss'],
})
export class AcademicsComponent {
  jssSubjects = [
    { name: 'English Language', icon: 'menu_book', division: 'Core', desc: 'Reading, writing, comprehension and oral communication skills.' },
    { name: 'Mathematics', icon: 'calculate', division: 'Core', desc: 'Algebra, geometry, statistics and problem solving.' },
    { name: 'Integrated Science', icon: 'science', division: 'Core', desc: 'Biology, chemistry, physics, and earth science fundamentals.' },
    { name: 'Social Studies', icon: 'public', division: 'Core', desc: 'History, geography, and civic education.' },
    { name: 'French', icon: 'translate', division: 'Core', desc: 'Introduction to French language and Francophone culture.' },
    { name: 'Religious and Moral Education', icon: 'mosque', division: 'Core', desc: 'Islamic and Christian studies, ethics and moral development.' },
    { name: 'Physical Education', icon: 'sports_soccer', division: 'Core', desc: 'Sports, fitness, and health education.' },
    { name: 'Home Economics', icon: 'kitchen', division: 'Vocational', desc: 'Cooking, nutrition, and domestic skills.' },
    { name: 'Visual Arts', icon: 'palette', division: 'Arts', desc: 'Drawing, painting, and creative expression.' },
  ];

  sssDivisions = [
    {
      name: 'Science',
      icon: 'biotech',
      subjects: [
        { name: 'Biology', icon: 'eco', desc: 'Cell biology, genetics, ecology, and human physiology.' },
        { name: 'Chemistry', icon: 'science', desc: 'Atomic theory, organic chemistry, and reactions.' },
        { name: 'Physics', icon: 'bolt', desc: 'Mechanics, electricity, waves, and thermodynamics.' },
        { name: 'Further Mathematics', icon: 'functions', desc: 'Calculus, statistics, and advanced algebra.' },
        { name: 'English Language', icon: 'menu_book', desc: 'Advanced comprehension, essay writing, and literature.' },
        { name: 'Mathematics', icon: 'calculate', desc: 'Core mathematics for science students.' },
      ],
    },
    {
      name: 'Arts',
      icon: 'history_edu',
      subjects: [
        { name: 'History', icon: 'history_edu', desc: 'African and world history, Sierra Leone history.' },
        { name: 'Geography', icon: 'terrain', desc: 'Physical, human, and economic geography.' },
        { name: 'Literature in English', icon: 'auto_stories', desc: 'African and world literature texts.' },
        { name: 'French', icon: 'translate', desc: 'Advanced French language skills.' },
        { name: 'English Language', icon: 'menu_book', desc: 'Advanced writing and communication.' },
        { name: 'Mathematics', icon: 'calculate', desc: 'Core mathematics.' },
      ],
    },
    {
      name: 'Commercial',
      icon: 'business',
      subjects: [
        { name: 'Economics', icon: 'trending_up', desc: 'Micro and macroeconomics, trade and markets.' },
        { name: 'Commerce', icon: 'store', desc: 'Business principles, trade, and distribution.' },
        { name: 'Accounts', icon: 'account_balance', desc: 'Bookkeeping, financial statements, and accounting.' },
        { name: 'Typewriting', icon: 'keyboard', desc: 'Typing speed and document formatting.' },
        { name: 'English Language', icon: 'menu_book', desc: 'Business communication and writing.' },
        { name: 'Mathematics', icon: 'calculate', desc: 'Core mathematics.' },
      ],
    },
  ];

  waecStats = [
    { value: '87%', label: 'WAEC Pass Rate (2024)' },
    { value: '12+', label: 'A1 Grades per Cohort' },
    { value: '100%', label: 'Exam Participation' },
    { value: '45+', label: 'Years of WAEC Results' },
  ];

  strategies = [
    { icon: 'quiz', title: 'Past Question Practice', desc: 'Students work through 10+ years of WAEC past questions across all subjects.' },
    { icon: 'groups', title: 'Revision Classes', desc: 'Intensive revision sessions every Saturday morning for SSS 3 students.' },
    { icon: 'person', title: 'One-on-One Support', desc: 'Personal academic mentoring from subject teachers for struggling students.' },
    { icon: 'library_books', title: 'Study Materials', desc: 'Comprehensive handouts, textbooks, and digital resources for all WAEC subjects.' },
  ];

  calendar = [
    { term: 'First Term', dates: 'Sep 2025 – Dec 2025', events: ['School re-opens', 'Mid-term assessments', 'Prize-giving day', 'Term exams', 'Christmas break begins'] },
    { term: 'Second Term', dates: 'Jan 2026 – Apr 2026', events: ['School re-opens', 'BECE mock exams', 'Sports day', 'Mid-term assessments', 'Easter break begins'] },
    { term: 'Third Term', dates: 'May 2026 – Jul 2026', events: ['School re-opens', 'WAEC/BECE examinations', 'Final assessments', 'Graduation ceremony', 'Long vacation begins'] },
  ];
}
