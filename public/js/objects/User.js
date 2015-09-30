var User = function(){
    this.name = '';
    this.status = 'active';
    this.image = 'img/avatar_default.png';
    this.game = '';
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
    return this.image;
};

User.prototype.setImage = function(img){
    this.image = img;
};

User.prototype.getObject = function(){
    return{
        name: this.name,
        status: this.status,
        image: this.image,
        game: this.game
    }
};

User.prototype.getGame = function(){
    return this.game;
};

User.prototype.setGame = function(game){
    this.game = game;
}

module.exports = User;