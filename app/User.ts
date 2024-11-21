class User {
  userId: number;
  username: string;
  password: string;
  //posts?: Post[],
  //comments?: Comment[],
  //likes?: Like[],
  //notifications?: Notification[],
  notifiableUsers?: User[];

  constructor(userId: number, username: string, password: string) {
    (this.userId = userId),
      (this.username = username),
      (this.password = password);
  }

  login(username: string, password: string): boolean {
    return username === this.username && password === this.password;
  }

  logout() {
    return true;
  }
}
