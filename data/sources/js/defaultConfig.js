var defaultPrefs = [{
					"name" : "TechCrunch", 
					"link" : "http://feeds.feedburner.com/Techcrunch",
					"wanted" : true
				 },
				 {
					"name" : "Gizmodo", 
					"link" : "http://feeds.gawker.com/gizmodo/full",
					"wanted" : true
				 },
				 {
					"name" : "Engadget", 
					"link" : "http://www.engadget.com/rss.xml",
					"wanted" : true
				 },
				 {
					"name" : "LifeHacker", 
					"link" : "http://feeds.gawker.com/lifehacker/vip",
					"wanted" : true
				 },
				 {
					"name" : "The Verge", 
					"link" : "http://www.theverge.com/rss/index.xml",
					"wanted" : true
				 },
				 {
					"name" : "Mashable", 
					"link" : "http://feeds.mashable.com/mashable/tech",
					"wanted" : true
				 },
				 {
					"name" : "Wired", 
					"link" : "http://feeds.wired.com/wired/index",
					"wanted" : true
				 },
				 {
					"name" : "The Next Web", 
					"link" : "http://thenextweb.com/feed/",
					"wanted" : true
				 }];

function getDefaultPrefs(){
	return defaultPrefs;
}

exports.getDefaultPrefs = getDefaultPrefs;