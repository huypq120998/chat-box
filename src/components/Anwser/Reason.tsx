export class Profile {
    name: string;
    reason: string;
  
    constructor(name: string, reason: string) {
      this.name = name;
      this.reason = reason;
    }
  }
  
  export const getProfileList = () => {
    let profiles = Array<Profile>();
    profiles.push(new Profile("Phản cảm/ Không an toàn", "Phản cảm/ Không an toàn"));
    profiles.push(new Profile("Không đúng sự thật", "Không đúng sự thật"));
    profiles.push(new Profile("Không hữu ích", "Không hữu ích"));
    return profiles;
  };
  