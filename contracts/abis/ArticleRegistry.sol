// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ArticleRegistry {
    struct Article {
        string title;
        string ipfsHash;
        uint256 price;
        address payable publisher;
        bool exists;
    }

    // State variables
    address public owner;
    string public contractName;
    mapping(uint256 => Article) public articles;
    mapping(address => mapping(uint256 => bool)) public accessPermissions;
    uint256 public articleCount;

    // Events
    event ArticlePublished(uint256 indexed articleId, string title, uint256 price);
    event AccessGranted(address indexed user, uint256 indexed articleId);
    event ArticlePurchased(address indexed buyer, uint256 indexed articleId, uint256 amount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        contractName = "ArticleRegistry";
    }

    // Track unique authors and their published count
    mapping(address => uint256) public authorArticleCount;
    address[] public allAuthors;

     function _trackAuthor(address _author) internal {
        if (authorArticleCount[_author] == 0) {
            allAuthors.push(_author); // new author
        }
        authorArticleCount[_author] += 1;
    }

    // Publish new article
    function publishArticle(
        string memory _title,
        string memory _ipfsHash,
        uint256 _price
    ) public returns (uint256) {
        uint256 articleId = articleCount++;
        articles[articleId] = Article({
            title: _title,
            ipfsHash: _ipfsHash,
            price: _price,
            publisher: payable(msg.sender),
            exists: true
        });

         accessPermissions[msg.sender][articleId] = true;

        emit ArticlePublished(articleId, _title, _price);
        _trackAuthor(msg.sender);
        return articleId;
    }
     // Function to get all authors and their article counts
    function getAllAuthors() public view returns (address[] memory authors, uint256[] memory counts) {
        uint256 len = allAuthors.length;
        authors = new address[](len);
        counts = new uint256[](len);
        for (uint256 i = 0; i < len; i++) {
            authors[i] = allAuthors[i];
            counts[i] = authorArticleCount[allAuthors[i]];
        }
    }

    // Support payment for an author
    event AuthorSupported(address indexed supporter, address indexed author, uint256 amount);

    function supportAuthor(address payable _author) public payable {
        require(_author != address(0), "Invalid author address");
        require(authorArticleCount[_author] > 0, "Address is not an author");
        require(msg.value > 0, "Must send ETH");

        (bool sent, ) = _author.call{value: msg.value}("");
        require(sent, "Payment failed");

        emit AuthorSupported(msg.sender, _author, msg.value);
    }

    // Grant access to article
    function grantAccess(address _user, uint256 _articleId) public {
        require(articles[_articleId].exists, "Article does not exist");
        require(
            msg.sender == owner || msg.sender == articles[_articleId].publisher,
            "Not authorized"
        );
        accessPermissions[_user][_articleId] = true;
        emit AccessGranted(_user, _articleId);
    }

    // Buy access to paywalled article
    function purchaseAccess(uint256 _articleId) public payable {
        require(articles[_articleId].exists, "Article does not exist");
        require(msg.value >= articles[_articleId].price, "Insufficient payment");

        // Transfer funds to publisher
        (bool sent, ) = articles[_articleId].publisher.call{value: msg.value}("");
        require(sent, "Payment failed");

        accessPermissions[msg.sender][_articleId] = true;
        emit ArticlePurchased(msg.sender, _articleId, msg.value);
    }

    // Check if user has access
    function checkAccess(address _user, uint256 _articleId) public view returns (bool) {
        return accessPermissions[_user][_articleId];
    }

    // Get single article metadata with access-controlled IPFS hash
    function getArticle(uint256 _articleId, address _user) public view returns (
        string memory title,
        string memory ipfsHash,
        uint256 price,
        address publisher,
        bool exists
    ) {
        Article memory article = articles[_articleId];
        require(article.exists, "Article does not exist");

        string memory ipfsToReturn = "";
        if (article.price == 0 || accessPermissions[_user][_articleId]) {
            ipfsToReturn = article.ipfsHash;
        }

        return (
            article.title,
            ipfsToReturn,
            article.price,
            article.publisher,
            article.exists
        );
    }

    // Get all articles with IPFS hashes filtered by access for given user
    function getArticles(address _user) public view returns (
        uint256[] memory ids,
        string[] memory titles,
        string[] memory ipfsHashes,
        uint256[] memory prices,
        address[] memory publishers,
        bool[] memory existsFlags
    ) {
        uint256 count = articleCount;

        ids = new uint256[](count);
        titles = new string[](count);
        ipfsHashes = new string[](count);
        prices = new uint256[](count);
        publishers = new address[](count);
        existsFlags = new bool[](count);

        for (uint256 i = 0; i < count; i++) {
            Article memory article = articles[i];
            ids[i] = i;
            titles[i] = article.title;
            prices[i] = article.price;
            publishers[i] = article.publisher;
            existsFlags[i] = article.exists;

            if (article.price == 0 || accessPermissions[_user][i]) {
                ipfsHashes[i] = article.ipfsHash;
            } else {
                ipfsHashes[i] = ""; // Hide IPFS for paywalled articles without access
            }
        }
    }

    // Ownership Management
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}  