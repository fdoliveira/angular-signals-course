import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { CoursesCardListComponent } from "../courses-card-list/courses-card-list.component";
import { Course } from '../models/course.model';
import { CoursesService } from '../services/courses.service';
import { CoursesServiceWithFetch } from '../services/courses-fetch.service';

@Component({
  selector: 'home',
  standalone: true,
  imports: [
    MatTabGroup,
    MatTab,
    CoursesCardListComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

  #courses = signal<Course[]>([]);

  couserService = inject(CoursesServiceWithFetch);

  beginnerCourses = computed(() => {
    const courses = this.#courses();
    return courses.filter(course => course.category === 'BEGINNER')
  });

  advancedCourses = computed(() => {
    const courses = this.#courses();
    return courses.filter(course => course.category === 'ADVANCED')
  });

  constructor() {
    this.loadCourses()
      .then(() => console.log(`All courses loaded:`, this.#courses()));

      effect(() => {
      console.log(`Beginner courses:`, this.beginnerCourses());
      console.log(`Advanced courses:`, this.advancedCourses());
    });
  }

  async loadCourses() {
    try {
      const courses = await this.couserService.loadAllCourses();
      this.#courses.set(courses);
    } catch (err) {
      alert(`Error loading courses`);
      console.error(err);
    }
  }
}
