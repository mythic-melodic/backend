'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _templateObject = _taggedTemplateLiteral(['\n    margin: 0 0 30px 0;\n'], ['\n    margin: 0 0 30px 0;\n']),
    _templateObject2 = _taggedTemplateLiteral(['\n    margin: 0 auto;\n    padding: 15px;\n    max-width: 650px;\n    text-align: center;\n    background-color: #fff;\n    borderTop: 1px solid #f7f7f7;\n    color: #333;\n'], ['\n    margin: 0 auto;\n    padding: 15px;\n    max-width: 650px;\n    text-align: center;\n    background-color: #fff;\n    borderTop: 1px solid #f7f7f7;\n    color: #333;\n']),
    _templateObject3 = _taggedTemplateLiteral(['\n    &:hover {\n        -webkit-filter: grayscale(100);\n        filter: grayscale(100);\n    }\n'], ['\n    &:hover {\n        -webkit-filter: grayscale(100);\n        filter: grayscale(100);\n    }\n']),
    _templateObject4 = _taggedTemplateLiteral(['\n    text-decoration: none;\n    &:hover {\n        text-decoration: none;\n        img{\n            -webkit-filter: grayscale(100);\n            filter: grayscale(100);\n        }\n        div {\n            background-color: #e7e7e7;\n        }\n    }\n    &:visited {\n        text-decoration: none;\n    }\n    &:active {\n        text-decoration: none;\n    }\n    &:focus {\n        text-decoration: none;\n    }\n'], ['\n    text-decoration: none;\n    &:hover {\n        text-decoration: none;\n        img{\n            -webkit-filter: grayscale(100);\n            filter: grayscale(100);\n        }\n        div {\n            background-color: #e7e7e7;\n        }\n    }\n    &:visited {\n        text-decoration: none;\n    }\n    &:active {\n        text-decoration: none;\n    }\n    &:focus {\n        text-decoration: none;\n    }\n']);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _styledComponents = require('styled-components');

var _styledComponents2 = _interopRequireDefault(_styledComponents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _taggedTemplateLiteral(strings, raw) { return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var Card = _styledComponents2.default.div(_templateObject);

var Caption = _styledComponents2.default.div(_templateObject2);

var Img = _styledComponents2.default.img(_templateObject3);

var Link = _styledComponents2.default.a(_templateObject4);

var SimpleCard = function (_React$Component) {
    _inherits(SimpleCard, _React$Component);

    function SimpleCard() {
        _classCallCheck(this, SimpleCard);

        return _possibleConstructorReturn(this, (SimpleCard.__proto__ || Object.getPrototypeOf(SimpleCard)).apply(this, arguments));
    }

    _createClass(SimpleCard, [{
        key: 'render',
        value: function render() {

            var heading = this.props.heading,
                subHeading = this.props.subHeading,
                href = this.props.href,
                imgSrc = this.props.imgSrc,
                imgAlt = this.props.imgAlt;

            return _react2.default.createElement(
                Card,
                { className: 'simple-card col-md-4 col-sm-12' },
                _react2.default.createElement(
                    Link,
                    { href: href },
                    _react2.default.createElement(Img, { src: imgSrc, className: 'img-responsive center-block', alt: imgAlt }),
                    _react2.default.createElement(
                        Caption,
                        null,
                        _react2.default.createElement(
                            'h4',
                            null,
                            heading
                        ),
                        _react2.default.createElement(
                            'p',
                            { className: 'text-muted' },
                            subHeading
                        )
                    )
                )
            );
        }
    }]);

    return SimpleCard;
}(_react2.default.Component);

SimpleCard.displayName = 'SimpleCard';

SimpleCard.propTypes = {
    href: _react2.default.PropTypes.string.isRequired,
    imgSrc: _react2.default.PropTypes.string.isRequired,
    imgAlt: _react2.default.PropTypes.string.isRequired,
    heading: _react2.default.PropTypes.string.isRequired,
    subHeading: _react2.default.PropTypes.string.isRequired
};

exports.default = SimpleCard;
//# sourceMappingURL=index.js.map
