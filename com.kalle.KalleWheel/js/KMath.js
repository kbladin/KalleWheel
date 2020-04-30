KVec2 = function(x, y) {
    this.x = x;
    this.y = y;
};

KVec2.prototype.add = function(v2) {
    var res = new KVec2(0, 0);
    res.x = this.x + v2.x;
    res.y = this.y + v2.y;
    return res;
},

KVec2.prototype.sub = function(v2) {
    var res = new KVec2(0, 0);
    res.x = this.x - v2.x;
    res.y = this.y - v2.y;
    return res;
},

KVec2.prototype.mul = function(s) {
    var res = new KVec2(0, 0);
    res.x = this.x * s;
    res.y = this.y * s;
    return res;
},

KVec2.prototype.div = function(s) {
    var res = new KVec2(0, 0);
    res.x = this.x / s;
    res.y = this.y / s;
    return res;
},

KVec2.prototype.dot = function(v2) {
    var res = this.x * v2.x + this.y * v2.y;
    return res;
},

KVec2.prototype.norm = function() {
    var norm = Math.sqrt(this.x * this.x + this.y * this.y);
    return norm;
},

KVec2.prototype.normalized = function() {
    var norm = this.norm();
    return this.div(norm);
}
