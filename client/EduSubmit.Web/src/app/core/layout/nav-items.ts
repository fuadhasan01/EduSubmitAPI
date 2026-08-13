import { NavItem } from './navigation.types';

export function getAdminNavItems(): NavItem[] {
  return [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin' },
    { label: 'Users', icon: 'people', route: '/admin/users' },
    { label: 'Classes', icon: 'class', route: '/admin/classes' },
    { label: 'Subjects', icon: 'subject', route: '/admin/subjects' },
    { label: 'Relationships', icon: 'link', route: '/admin/relationships' },
    { label: 'Assignments', icon: 'assignment', route: '/admin/assignments' },
    { label: 'Submissions', icon: 'submission', route: '/admin/submissions' },
  ];
}

export function getTeacherNavItems(): NavItem[] {
  return [
    { label: 'Dashboard', icon: 'dashboard', route: '/teacher' },
    { label: 'Assignments', icon: 'assignment', route: '/teacher/assignments' },
    { label: 'Submissions', icon: 'submission', route: '/teacher/submissions' },
  ];
}

export function getStudentNavItems(): NavItem[] {
  return [
    { label: 'Dashboard', icon: 'dashboard', route: '/student' },
    { label: 'Assignments', icon: 'assignment', route: '/student/assignments' },
    { label: 'Submissions', icon: 'submission', route: '/student/submissions' },
  ];
}
