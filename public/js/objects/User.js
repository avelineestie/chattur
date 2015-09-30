var User = function(){
    this.name = "";
    this.status = "active";
    this.img = "img/avatar_default.png";
};

User.prototype.getName = function(){
    return this.name;
};

User.prototype.setName = function(name){
    this.name = name;
};

User.prototype.getStatus = function(){
    return this.status;
};

User.prototype.setStatus = function(status){
    this.status = status;
};

User.prototype.getImage = function(){
    return this.img;
};

User.prototype.setImage = function(img){
    this.img = img;
};

User.prototype.getObject = function(){
    return{
        name: this.name,
        status: this.status,
        image: this.image
    }
};

module.exports = User;