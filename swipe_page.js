const SERVER_URL = "https://ec2-3-16-14-138.us-east-2.compute.amazonaws.com";
const SERVER_PORT = 5634;

$.ajax( {
    url:SERVER_URL+":"+ SERVER_PORT+"/randomCard",
    type: 'GET'
}).then(response => {
    console.log(response.card.imageUrl);
    $("#card_image").attr('src', response.card.imageUrl);
    $("#card_name").text(response.card.name);
    $("#info_text").text(response.card.text);
    $("#flavor_text").text(response.card.flavor);
});