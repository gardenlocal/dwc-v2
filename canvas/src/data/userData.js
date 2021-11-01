import UserService from "../services/user.service";
import "regenerator-runtime/runtime"

class UserData {

 constructor(){
   this.user = JSON.parse(localStorage.getItem("user"));
   this.role = this.user?.role[0];
   this.username = this.user?.username;
   this.garden = JSON.stringify(this.user?.gardenSection);
   this.token = this.user?.accessToken;
   this.email = this.user?.email;
 }

 async getAdminData() {
   //if(this.role === "ROLE_ADMIN") {
  if (true) {
    const allGardens = await UserService.getAdminGarden()
    console.log('all gardens: ', allGardens)
    return allGardens;
   } else {
     console.log("ACCESS DENIED")
     return false;
   }
 }

 getPublicData() {
   console.log("public data");
   // UserService.getPublicContent().then((data) => console.log(data));
 }
}

export default new UserData();