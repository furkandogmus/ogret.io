const React = require("react");
const { View } = require("react-native");

function MockIcon(props) {
  return React.createElement(View, props);
}
MockIcon.glyphMap = {};
MockIcon.getImageSource = function () {
  return Promise.resolve("");
};

module.exports = {
  Ionicons: MockIcon,
  MaterialIcons: MockIcon,
  MaterialCommunityIcons: MockIcon,
  FontAwesome: MockIcon,
  AntDesign: MockIcon,
  Feather: MockIcon,
};
module.exports.default = MockIcon;
