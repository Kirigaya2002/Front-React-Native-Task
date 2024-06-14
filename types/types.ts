export interface Task {
    id: number;
    title: string;
    description: string;
    dueDate: string;
    taskProgress: string;
    priority: string;
    photoUrl: string;
    hours: number;
    isReady: string;
    user: User;
  }
  
  interface User {
    id: number;
    userName: string;
    isActive: string;
  }
  