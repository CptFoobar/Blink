(function() {

    var app = angular.module('blink', ['ngAnimate', 'ngRoute', 'ngMaterial', 'ui.bootstrap']);
    // TODO: Set theme as per user setting
    var dark = true;

    app.config(function($routeProvider, $mdThemingProvider) {
/*        var customPrimary = {
            '50': '#e9cbf5',
            '100': '#dfb6f1',
            '200': '#d6a0ed',
            '300': '#cd8be9',
            '400': '#c375e5',
            '500': '#ba60e1',
            '600': '#b14bdd',
            '700': '#a735d9',
            '800': '#9b27ce',
            '900': '#8b23b8',
            'A100': '#f2e1f9',
            'A200': '#fbf6fd',
            'A400': '#ffffff',
            'A700': '#7b1fa3'
        };
        $mdThemingProvider
            .definePalette('customPrimary',
                customPrimary);

        var customAccent = {
            '50': '#f492b3',
            '100': '#f27ba3',
            '200': '#f06493',
            '300': '#ee4c83',
            '400': '#eb3573',
            '500': '#E91E63',
            '600': '#d81557',
            '700': '#c1134e',
            '800': '#aa1145',
            '900': '#930e3b',
            'A100': '#f7a9c4',
            'A200': '#f9c1d4',
            'A400': '#fbd8e4',
            'A700': '#7b0c32'
        };
        $mdThemingProvider
            .definePalette('customAccent',
                customAccent);

        var customWarn = {
            '50': '#ffb8a1',
            '100': '#ffa588',
            '200': '#ff916e',
            '300': '#ff7e55',
            '400': '#ff6a3b',
            '500': '#FF5722',
            '600': '#ff4408',
            '700': '#ee3900',
            '800': '#d43300',
            '900': '#bb2d00',
            'A100': '#ffcbbb',
            'A200': '#ffdfd4',
            'A400': '#fff2ee',
            'A700': '#a12700'
        };
        $mdThemingProvider
            .definePalette('customWarn',
                customWarn);

        var customBackground = {
            '50': '#b2b2b2',
            '100': '#a5a5a5',
            '200': '#989898',
            '300': '#8b8b8b',
            '400': '#7f7f7f',
            '500': '#727272',
            '600': '#656565',
            '700': '#585858',
            '800': '#4c4c4c',
            '900': '#3f3f3f',
            'A100': '#bebebe',
            'A200': '#cbcbcb',
            'A400': '#d8d8d8',
            'A700': '#323232'
        };
        $mdThemingProvider
            .definePalette('customBackground',
                customBackground);

        $mdThemingProvider.theme('default')
            .primaryPalette('customPrimary')
            .accentPalette('customAccent')
            .warnPalette('customWarn')
            .backgroundPalette('customBackground');
*/

        $mdThemingProvider.theme('default')
            .primaryPalette('purple')
            .accentPalette('pink')
            .warnPalette('red')
            .backgroundPalette('blue-grey');

        if (dark)
            $mdThemingProvider.theme('default').dark();

        $routeProvider
            .when("/blink", {
                templateUrl: "home.html",
                controller: "HomeController"
            })
            .otherwise({
                redirectTo: "/blink"
            });
    });
}());
