import { Component, computed, effect, inject, signal } from '@angular/core';
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { CoursesCardListComponent } from "../courses-card-list/courses-card-list.component";
import { Course, sortCoursesBySeqNo } from '../models/course.model';
import { CoursesService } from '../services/courses.service';
import { openEditCourseDialog } from '../edit-course-dialog/edit-course-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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

  couserService = inject(CoursesService);

  dialog = inject(MatDialog);

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
      this.#courses.set(courses.sort(sortCoursesBySeqNo));
    } catch (err) {
      alert(`Error loading courses`);
      console.error(err);
    }
  }

  onCourseUpdated(updatedCourse: Course) {
    const courses = this.#courses();
    const newCourses = courses.map(course => (
      course.id === updatedCourse.id ? updatedCourse : course
    ));
    this.#courses.set(newCourses);
  }

  async onCourseDeleted(courseId: string) {
    try {
      await this.couserService.deleteCourse(courseId);
      const courses = this.#courses();
      const newCourses = courses.filter(
        course => course.id !== courseId)
      this.#courses.set(newCourses);
    }
    catch (err) {
      console.error(err)
      alert(`Error deleting course.`)
    }
  }

  async onAddCourse() {
    const newCourse = await openEditCourseDialog(
      this.dialog,
      {
        mode: "create",
        title: "Create New Course"
      }
    )
    if (!newCourse) {
      return;
    }
    const newCourses = [
      ...this.#courses(),
      newCourse
    ];
    this.#courses.set(newCourses);
  }
}
