var parseFeedSource = function(json, wanted) {
    var sourceObject = json.results[0];
    var parsedSource = {
        title: sourceObject.title,
        websiteUrl: sourceObject.website,
        streamId: sourceObject.feedId,
        icon: sourceObject.visualUrl ? sourceObject.visualUrl :
            "https://3.bp.blogspot.com/-D2x8xz_G1XU/VmRzmjOSPXI/AAAAAAAAAG4/u_zPLu_LIls/s320/logo_placeholder.png",
        description: sourceObject.description ?
                        sourceObject.description : "...",
        tags: sourceObject.deliciousTags ?
                        sourceObject.deliciousTags : [],
        wanted: wanted
    };
    return parsedSource;
};

const migrate = function(oldPrefs) {
    console.log("migrating");
    var Request = require("sdk/request").Request;
    var migratedList = [];
    var searchUrlPrefix = "https://cloud.feedly.com/v3/search/feeds?q=";
    for (let i = 0; i < oldPrefs.length; i++) {
        let url = searchUrlPrefix + oldPrefs[i].link;
        Request({
            url: url,
            onComplete: function(response) {
                if (response.status === 200) {
                    migratedList.push(parseFeedSource(response.json, oldPrefs[i].wanted));
                }
            }
        }).get();
    }
    return migratedList;
};

exports.migrate = migrate;
