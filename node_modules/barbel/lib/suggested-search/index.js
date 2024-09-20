'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var KEY_ENTER = 13;
var KEY_ESCAPE = 27;
var KEY_UP = 38;
var KEY_DOWN = 40;

var STYLES = {
    form: {
        position: 'relative'
    },
    input: {
        padding: '0 10px 0 45px'
    },
    button: {
        position: 'absolute',
        left: '5px',
        top: '7px',
        textAlign: 'center',
        border: 'none',
        backgroundColor: '#fff'
    },
    searchIcon: {
        position: 'absolute',
        left: '18px',
        top: '16px',
        textAlign: 'center',
        border: 'none'
    },
    searchResults: {
        marginTop: '5px'
    }
};

var SuggestedSearch = function (_React$Component) {
    _inherits(SuggestedSearch, _React$Component);

    function SuggestedSearch(props) {
        var _this$keyDownHandlers;

        _classCallCheck(this, SuggestedSearch);

        var _this = _possibleConstructorReturn(this, (SuggestedSearch.__proto__ || Object.getPrototypeOf(SuggestedSearch)).call(this, props));

        _this.state = {
            searchValue: props.search || '',
            activeIndex: -1
        };

        _this.keyDownHandlers = (_this$keyDownHandlers = {}, _defineProperty(_this$keyDownHandlers, KEY_ESCAPE, function () {
            _this.clearSearchInput();
        }), _defineProperty(_this$keyDownHandlers, KEY_DOWN, function (event) {
            event.preventDefault();
            _this.selectNextResult();
        }), _defineProperty(_this$keyDownHandlers, KEY_UP, function (event) {
            event.preventDefault();
            _this.selectPreviousResult();
        }), _this$keyDownHandlers);
        return _this;
    }

    _createClass(SuggestedSearch, [{
        key: 'itemMatchesSearch',
        value: function itemMatchesSearch(item) {
            var searchValue = this.state.searchValue.toLowerCase();

            return searchValue && item.name.toLowerCase().indexOf(searchValue) > -1;
        }
    }, {
        key: 'resultsMatchingSearch',
        value: function resultsMatchingSearch() {
            var _this2 = this;

            return this.props.items.filter(function (item) {
                return _this2.itemMatchesSearch(item);
            });
        }
    }, {
        key: 'itemStartsWithSearchTerm',
        value: function itemStartsWithSearchTerm(item) {
            return item.name.toLowerCase().indexOf(this.state.searchValue.toLowerCase()) === 0;
        }
    }, {
        key: 'resultsStartingWithSearchTerm',
        value: function resultsStartingWithSearchTerm(results) {
            var _this3 = this;

            return results.filter(function (result) {
                return _this3.itemStartsWithSearchTerm(result);
            });
        }
    }, {
        key: 'remainingResults',
        value: function remainingResults(matchingResults, resultsStartingWithSearchTerm) {
            return matchingResults.filter(function (item) {
                return resultsStartingWithSearchTerm.indexOf(item) === -1;
            });
        }
    }, {
        key: 'alphabeticallyOrder',
        value: function alphabeticallyOrder(list) {
            return list.sort(function (itemA, itemB) {
                return itemA.name.localeCompare(itemB.name);
            });
        }
    }, {
        key: 'orderedResults',
        value: function orderedResults() {
            if (this.state.searchValue.length < 2) {
                return [];
            }
            var resultsMatchingSearch = this.resultsMatchingSearch();

            var resultsStartingWithSearchTerm = this.resultsStartingWithSearchTerm(resultsMatchingSearch);

            var remainingResults = this.remainingResults(resultsMatchingSearch, resultsStartingWithSearchTerm);

            var allResults = this.alphabeticallyOrder(resultsStartingWithSearchTerm).concat(this.alphabeticallyOrder(remainingResults));

            return allResults;
        }
    }, {
        key: 'shouldShowError',
        value: function shouldShowError(orderedResults) {
            return orderedResults.length === 0 && this.state.searchValue.length >= 2;
        }
    }, {
        key: 'handleChange',
        value: function handleChange(event) {
            if (event.target) {
                this.setState({
                    searchValue: event.target.value,
                    activeIndex: -1
                });
            }
        }
    }, {
        key: 'selectNextResult',
        value: function selectNextResult() {
            var orderedResults = this.orderedResults();

            if (this.state.activeIndex < orderedResults.length - 1) {
                this.setState({ activeIndex: this.state.activeIndex + 1 });
            }
        }
    }, {
        key: 'selectPreviousResult',
        value: function selectPreviousResult() {
            if (this.state.activeIndex > -1) {
                this.setState({ activeIndex: this.state.activeIndex - 1 });
            }
        }
    }, {
        key: 'handleKeyDown',
        value: function handleKeyDown(event) {
            var handler = this.keyDownHandlers[event.keyCode];

            if (handler) {
                handler(event);
            }
        }
    }, {
        key: 'handleInputKeyDown',
        value: function handleInputKeyDown(event) {
            if (event.keyCode === KEY_ENTER) {
                event.preventDefault();
            }

            this.handleKeyDown(event);
        }
    }, {
        key: 'clearSearchInput',
        value: function clearSearchInput() {
            this.setState({ searchValue: '' });
        }
    }, {
        key: 'searchResultID',
        value: function searchResultID(index) {
            return 'search-result-' + index;
        }
    }, {
        key: 'renderResultsError',
        value: function renderResultsError() {
            var errorMessageTemplate = this.props.errorMessage || 'Sorry, there are no search results for {{search}}';

            var errorMessage = errorMessageTemplate.replace(/{{search}}/g, this.state.searchValue);

            return _react2.default.createElement(
                'div',
                { className: 'well well-sm error' },
                errorMessage
            );
        }
    }, {
        key: 'renderResultsList',
        value: function renderResultsList(orderedResults) {
            var _this4 = this;

            var renderedResults = orderedResults.map(function (result, index) {
                return _this4.renderResultLink(result, index);
            });

            var activeDescendant = null;

            if (this.state.activeIndex > -1) {
                activeDescendant = this.searchResultID(this.state.activeIndex);
            }

            return _react2.default.createElement(
                'div',
                {
                    id: 'search-results-list',
                    'aria-activedescendant': activeDescendant,
                    className: 'list-group',
                    role: 'listbox' },
                renderedResults
            );
        }
    }, {
        key: 'renderResultLink',
        value: function renderResultLink(item, index) {
            var _this5 = this;

            if (item.url) {
                var isActive = index === this.state.activeIndex;

                var className = 'list-group-item ' + (isActive ? ' active' : '');

                return _react2.default.createElement(
                    'a',
                    {
                        id: this.searchResultID(index),
                        className: className,
                        role: 'option',
                        href: item.url,
                        onKeyDown: function onKeyDown(event) {
                            return _this5.handleKeyDown(event);
                        },
                        key: index
                    },
                    item.name
                );
            }

            return item.name;
        }
    }, {
        key: 'renderResults',
        value: function renderResults() {
            var orderedResults = this.orderedResults();

            return _react2.default.createElement(
                'div',
                { role: 'region', id: 'search-results', 'aria-live': 'polite', style: STYLES.searchResults },
                this.shouldShowError(orderedResults) ? this.renderResultsError() : this.renderResultsList(orderedResults)
            );
        }
    }, {
        key: 'renderSearchButton',
        value: function renderSearchButton() {
            return _react2.default.createElement(
                'i',
                { style: STYLES.searchIcon, className: 'search-icon glyphicon glyphicon-search' },
                _react2.default.createElement(
                    'span',
                    { className: 'hidden' },
                    'Search'
                )
            );
        }
    }, {
        key: 'renderClearButton',
        value: function renderClearButton() {
            var _this6 = this;

            return _react2.default.createElement(
                'button',
                {
                    style: STYLES.button,
                    key: 'clear-button',
                    type: 'button',
                    onClick: function onClick() {
                        return _this6.clearSearchInput();
                    },
                    className: 'btn btn-default clear' },
                _react2.default.createElement(
                    'i',
                    { className: 'clear-icon glyphicon glyphicon-remove-sign' },
                    _react2.default.createElement(
                        'span',
                        { className: 'hidden' },
                        'Clear input'
                    )
                )
            );
        }
    }, {
        key: 'renderIcon',
        value: function renderIcon() {
            return this.state.searchValue.length > 0 && !this.props.search ? this.renderClearButton() : this.renderSearchButton();
        }
    }, {
        key: 'render',
        value: function render() {
            var _this7 = this;

            return _react2.default.createElement(
                'form',
                { action: '', method: 'get', style: STYLES.form, role: 'search' },
                _react2.default.createElement(
                    'label',
                    { htmlFor: 'search', className: 'hidden', id: 'search-input' },
                    this.props.label
                ),
                _react2.default.createElement('input', {
                    style: STYLES.input,
                    type: 'text',
                    name: 'search',
                    className: 'form-control input-lg',
                    placeholder: this.props.placeholder,
                    onChange: function onChange(event) {
                        return _this7.handleChange(event);
                    },
                    onKeyDown: function onKeyDown(event) {
                        return _this7.handleInputKeyDown(event);
                    },
                    value: this.state.searchValue,
                    autoCapitalize: 'off',
                    autoComplete: 'off',
                    autoCorrect: 'off',
                    'aria-label': 'Search',
                    'aria-haspopup': 'true',
                    role: 'combobox',
                    'aria-autocomplete': 'both',
                    'aria-controls': 'search-results'
                }),
                this.renderIcon(),
                this.renderResults()
            );
        }
    }, {
        key: 'componentDidUpdate',
        value: function componentDidUpdate() {

            var list = document.getElementById('search-results-list');

            if (list) {
                var activeDescendant = document.getElementById(list.getAttribute('aria-activedescendant'));

                if (activeDescendant) {
                    activeDescendant.focus();
                } else {
                    var input = document.getElementById('search-input');

                    if (input) {
                        input.focus();
                    }
                }
            }
        }
    }]);

    return SuggestedSearch;
}(_react2.default.Component);

exports.default = SuggestedSearch;


SuggestedSearch.displayName = 'SuggestedSearch';

SuggestedSearch.propTypes = {
    search: _react2.default.PropTypes.string,
    items: _react2.default.PropTypes.array.isRequired,
    label: _react2.default.PropTypes.string,
    placeholder: _react2.default.PropTypes.string,
    errorMessage: _react2.default.PropTypes.string
};
//# sourceMappingURL=index.js.map
