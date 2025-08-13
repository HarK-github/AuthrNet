// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ArticleRegistry {
    struct Article {
        string title;
        string description; // short summary
        string ipfsHash;    // IPFS hash of content
        uint256 price;      // price in wei (0 = free)
        address payable publisher;
        bool exists;
    }

    address public owner;
    string public contractName;
    uint256 public articleCount;

    mapping(uint256 => Article) public articles;
    mapping(address => mapping(uint256 => bool)) public accessPermissions;

    event ArticlePublished(uint256 indexed articleId, string title, uint256 price, address publisher);
    event AccessGranted(address indexed user, uint256 indexed articleId);
    event ArticlePurchased(address indexed buyer, uint256 indexed articleId, uint256 amount);
    event TipSent(address indexed tipper, address indexed publisher, uint256 indexed articleId, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not contract owner");
        _;
    }

    modifier onlyPublisherOrOwner(uint256 _articleId) {
        require(articles[_articleId].exists, "Article does not exist");
        require(
            msg.sender == owner || msg.sender == articles[_articleId].publisher,
            "Not authorized"
        );
        _;
    }

    constructor() {
        owner = msg.sender;
        contractName = "ArticleRegistry";
    }

    // Publish new article
    function publishArticle(
        string memory _title,
        string memory _description,
        string memory _ipfsHash,
        uint256 _price
    ) public returns (uint256) {
        uint256 articleId = articleCount;
        articles[articleId] = Article({
            title: _title,
            description: _description,
            ipfsHash: _ipfsHash,
            price: _price,
            publisher: payable(msg.sender),
            exists: true
        });

        // Give publisher automatic access
        accessPermissions[msg.sender][articleId] = true;

        articleCount++;
        emit ArticlePublished(articleId, _title, _price, msg.sender);
        return articleId;
    }

    // Grant access to an article
    function grantAccess(address _user, uint256 _articleId) public onlyPublisherOrOwner(_articleId) {
        accessPermissions[_user][_articleId] = true;
        emit AccessGranted(_user, _articleId);
    }

    // Buy access to article
    function purchaseAccess(uint256 _articleId) public payable {
        Article memory article = articles[_articleId];
        require(article.exists, "Article does not exist");
        require(article.price > 0, "This article is free");
        require(msg.value >= article.price, "Insufficient payment");

        // Send payment directly to publisher
        (bool sent, ) = article.publisher.call{value: msg.value}("");
        require(sent, "Payment failed");

        accessPermissions[msg.sender][_articleId] = true;
        emit ArticlePurchased(msg.sender, _articleId, msg.value);
    }

    // Send a tip to the publisher
    function tipPublisher(uint256 _articleId) public payable {
        Article memory article = articles[_articleId];
        require(article.exists, "Article does not exist");
        require(msg.value > 0, "Tip must be greater than zero");

        (bool sent, ) = article.publisher.call{value: msg.value}("");
        require(sent, "Tip failed");

        emit TipSent(msg.sender, article.publisher, _articleId, msg.value);
    }

    // Check if a user has access to an article
    function checkAccess(address _user, uint256 _articleId) public view returns (bool) {
        Article memory article = articles[_articleId];
        if (!article.exists) return false;
        if (article.price == 0) return true; // free content
        return accessPermissions[_user][_articleId];
    }

    // Get article metadata (only show IPFS if access is granted)
    function getArticle(uint256 _articleId, address _user) public view returns (
        string memory title,
        string memory description,
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
            article.description,
            ipfsToReturn,
            article.price,
            article.publisher,
            article.exists
        );
    }

    // Transfer contract ownership
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
